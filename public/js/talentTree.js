/**
 * ================================================================
 *  UP DANCE EXPERIENCE — ÁRVORE DE TALENTOS
 *  /js/talentTree.js   ·   motor da página
 * ----------------------------------------------------------------
 *  Requisitos:
 *    - /js/talentTree.data.js carregado ANTES deste arquivo
 *      (expõe window.UDX_TALENTOS)
 *    - Marcação-âncora de /membros/nivel-estagiario/arvore-de-talentos/
 *
 *  RESPONSABILIDADES
 *  -----------------
 *   1. Portaria     — só renderiza para quem já é Estagiário(a)+
 *   2. Estado       — carrega/salva no Worker; degrada para local
 *   3. Render       — três árvores, conectores SVG, faixas e nós
 *   4. Regras       — investir / remover pontos com validação total
 *   5. Desafios     — envio de comprovação e crédito de XP
 *   6. Títulos      — desbloqueio permanente por conquista
 *
 *  IMPORTANTE
 *  ----------------
 *  O saldo de XP é sempre AUTORIDADE DO SERVIDOR. O cliente apenas
 *  reflete o que o Worker devolve. A alocação de pontos (as páginas
 *  de plano) é livre e reversível — por isso vive no cliente até o
 *  "Salvar plano".
 * ================================================================ */
(function (win, doc) {
  'use strict';

  var DADOS = win.UDX_TALENTOS;
  if (!DADOS) { return; }

  /* ============================================================
     0) CONSTANTES E ATALHOS
  ============================================================ */
  var API = {
    me:      '/api/me',
    estado:  '/api/talentos/estado',
    salvar:  '/api/talentos/plano',
    desafio: '/api/talentos/desafio'
  };

  var CHAVE_LOCAL   = 'udx:talentos:v1';
  var MAX_PAGINAS   = 5;
  var XP_POR_PONTO  = DADOS.xpPorPonto || 100;
  var ARVORE        = DADOS.arvore || 'talentos';   // chave de ROTAS em desafios.js
  var MULTI         = DADOS.multiestilo || { estilos: [], grupos: {}, tiers: [] };
  var NOME_ESTILO   = {};
  MULTI.estilos.forEach(function (e) { NOME_ESTILO[e.id] = e.nome; });

  var $  = function (sel, ctx) { return (ctx || doc).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); };

  function el(tag, cls, html) {
    var n = doc.createElement(tag);
    if (cls)  { n.className = cls; }
    if (html != null) { n.innerHTML = html; }
    return n;
  }
  function escapar(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function perfilPorId(id) {
    for (var i = 0; i < DADOS.perfis.length; i++) {
      if (DADOS.perfis[i].id === id) { return DADOS.perfis[i]; }
    }
    return null;
  }
  function tierDe(perfil, n) {
    for (var i = 0; i < perfil.tiers.length; i++) {
      if (perfil.tiers[i].n === n) { return perfil.tiers[i]; }
    }
    return { n: n, nome: 'Faixa ' + n, requisito: 0 };
  }


  /* ============================================================
     1) ESTADO
  ============================================================ */
  var Estado = {

    dados: null,
    limpo: null,     // cópia da última versão salva (para "Reverter")
    online: false,   // true quando o Worker respondeu

    inicial: function () {
      var xp = {};
      DADOS.perfis.forEach(function (p) { xp[p.id] = 0; });
      return {
        versao:      DADOS.versao,
        xp:          xp,
        desafios:    [],
        titulos:     [],
        envios:      {},      // multiestilo: { 'mx-cad-1': { status, estilos: [], nota } }
        repTitulos:  [],      // ids de talent_rep_titulos (ex.: 'trans-cadencias-2')
        paginaAtual: 1,
        paginas:     [{ id: 1, nome: 'Plano 01', alocacao: {} }]
      };
    },

    normalizar: function (bruto) {
      var base = Estado.inicial();
      if (!bruto || typeof bruto !== 'object') { return base; }

      DADOS.perfis.forEach(function (p) {
        var v = bruto.xp && bruto.xp[p.id];
        base.xp[p.id] = (typeof v === 'number' && v >= 0) ? Math.floor(v) : 0;
      });

      base.desafios = Array.isArray(bruto.desafios) ? bruto.desafios.slice() : [];
      base.titulos  = Array.isArray(bruto.titulos)  ? bruto.titulos.slice()  : [];
      if (bruto.envios && typeof bruto.envios === 'object') {
        Object.keys(bruto.envios).forEach(function (id) {
          var e = bruto.envios[id] || {};
          base.envios[id] = {
            status:  String(e.status || ''),
            estilos: Array.isArray(e.estilos) ? e.estilos.filter(function (x) { return NOME_ESTILO[x]; }) : [],
            nota:    (typeof e.nota === 'number') ? e.nota : null
          };
        });
      }
      base.repTitulos = Array.isArray(bruto.repTitulos) ? bruto.repTitulos.map(String) : [];

      if (Array.isArray(bruto.paginas) && bruto.paginas.length) {
        base.paginas = bruto.paginas.slice(0, MAX_PAGINAS).map(function (pg, i) {
          var aloc = {};
          if (pg && pg.alocacao) {
            Object.keys(pg.alocacao).forEach(function (k) {
              var h = DADOS.indice[k];
              var v = Math.floor(pg.alocacao[k]);
              if (h && v > 0) { aloc[k] = Math.min(v, h.ranksMax); }
            });
          }
          return {
            id:   (pg && pg.id) || (i + 1),
            nome: (pg && pg.nome) || ('Plano 0' + (i + 1)),
            alocacao: aloc
          };
        });
      }

      var atual = Math.floor(bruto.paginaAtual || 1);
      base.paginaAtual = base.paginas.some(function (p) { return p.id === atual; })
        ? atual : base.paginas[0].id;

      return base;
    },

    /* -------- persistência local (degradação graciosa) -------- */
    lerLocal: function () {
      try {
        var raw = win.localStorage.getItem(CHAVE_LOCAL);
        return raw ? JSON.parse(raw) : null;
      } catch (e) { return null; }
    },
    gravarLocal: function () {
      try {
        win.localStorage.setItem(CHAVE_LOCAL, JSON.stringify(Estado.dados));
      } catch (e) { /* modo privado / storage bloqueado — segue em memória */ }
    },

    /* -------- carga -------- */
    carregar: function () {
      return fetch(API.estado, { credentials: 'same-origin' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) {
          if (!j) { throw new Error('sem estado remoto'); }
          Estado.online = true;
          Estado.dados  = Estado.normalizar(j);
        })
        .catch(function () {
          Estado.online = false;
          Estado.dados  = Estado.normalizar(Estado.lerLocal());
        })
        .then(function () {
          Estado.limpo = JSON.stringify(Estado.dados.paginas);
        });
    },

    /* -------- página ativa -------- */
    pagina: function () {
      var d = Estado.dados;
      for (var i = 0; i < d.paginas.length; i++) {
        if (d.paginas[i].id === d.paginaAtual) { return d.paginas[i]; }
      }
      return d.paginas[0];
    },
    alocacao: function () { return Estado.pagina().alocacao; },
    rank: function (habId) { return Estado.alocacao()[habId] || 0; },

    sujo: function () {
      return JSON.stringify(Estado.dados.paginas) !== Estado.limpo;
    }
  };


  /* ============================================================
     2) REGRAS — o coração do sistema
  ============================================================ */
  /* Títulos de carreira e transversais não recebem pontos. */
  function naoInvestivel(h) { return !!h && (h.tipo === 'titulo' || h.tipo === 'transversal'); }

  var Regras = {

    /* XP acumulado do perfil, derivado dos desafios concluídos */
    xpDoPerfil: function (perfilId) {
      return Estado.dados.xp[perfilId] || 0;
    },

    pontosTotais: function (perfilId) {
      return Math.floor(Regras.xpDoPerfil(perfilId) / XP_POR_PONTO);
    },

    /* Pontos investidos no perfil dentro de uma alocação qualquer */
    pontosGastos: function (perfilId, aloc) {
      aloc = aloc || Estado.alocacao();
      var total = 0;
      Object.keys(aloc).forEach(function (id) {
        var h = DADOS.indice[id];
        if (h && h.perfilId === perfilId && !naoInvestivel(h)) {
          total += aloc[id];
        }
      });
      return total;
    },

    pontosDisponiveis: function (perfilId, aloc) {
      return Regras.pontosTotais(perfilId) - Regras.pontosGastos(perfilId, aloc);
    },

    /* A faixa está liberada nesta alocação? */
    tierLiberado: function (perfil, n, aloc) {
      var t = tierDe(perfil, n);
      return Regras.pontosGastos(perfil.id, aloc) >= t.requisito;
    },

    /* Todos os pré-requisitos estão no rank máximo? */
    prereqsOk: function (hab, aloc) {
      aloc = aloc || Estado.alocacao();
      return hab.requer.every(function (id) {
        var pr = DADOS.indice[id];
        return pr && (aloc[id] || 0) >= pr.ranksMax;
      });
    },

    /* Requisitos pendentes, em texto — usado no tooltip */
    pendencias: function (hab, aloc) {
      aloc = aloc || Estado.alocacao();
      var perfil = perfilPorId(hab.perfilId);
      var lista  = [];

      var t = tierDe(perfil, hab.tier);
      var gastos = Regras.pontosGastos(perfil.id, aloc);
      if (gastos < t.requisito) {
        lista.push('Invista ' + (t.requisito - gastos) +
                   ' ponto(s) a mais em ' + perfil.nome + ' para abrir esta faixa.');
      }
      hab.requer.forEach(function (id) {
        var pr = DADOS.indice[id];
        if (!pr) { return; }
        if ((aloc[id] || 0) < pr.ranksMax) {
          lista.push('Requer ' + pr.nome + ' no nível ' + pr.ranksMax + '.');
        }
      });
      return lista;
    },

    /* Uma alocação inteira é internamente válida? */
    alocacaoValida: function (perfilId, aloc) {
      var perfil = perfilPorId(perfilId);
      if (Regras.pontosGastos(perfilId, aloc) > Regras.pontosTotais(perfilId)) {
        return false;
      }
      return perfil.habilidades.every(function (h) {
        var r = aloc[h.id] || 0;
        if (r === 0) { return true; }
        if (r > h.ranksMax) { return false; }
        if (!Regras.tierLiberado(perfil, h.tier, aloc)) { return false; }
        return Regras.prereqsOk(h, aloc);
      });
    },

    podeInvestir: function (hab) {
      if (naoInvestivel(hab)) { return false; }
      var aloc = Estado.alocacao();
      if ((aloc[hab.id] || 0) >= hab.ranksMax) { return false; }
      if (Regras.pontosDisponiveis(hab.perfilId, aloc) <= 0) { return false; }
      if (!Regras.tierLiberado(perfilPorId(hab.perfilId), hab.tier, aloc)) { return false; }
      return Regras.prereqsOk(hab, aloc);
    },

    /* Remover é permitido só se a alocação resultante continuar válida.
       Isso impede "puxar o tapete" de uma habilidade que depende desta. */
    podeRemover: function (hab) {
      var aloc = Estado.alocacao();
      if (!(aloc[hab.id] > 0)) { return false; }
      var teste = {};
      Object.keys(aloc).forEach(function (k) { teste[k] = aloc[k]; });
      teste[hab.id] -= 1;
      if (teste[hab.id] === 0) { delete teste[hab.id]; }
      return Regras.alocacaoValida(hab.perfilId, teste);
    },

    /* Estado visual do nó */
    estadoDoNo: function (hab) {
      if (hab.tipo === 'transversal') {
        var tt = UI.tierConquistado(hab.titulo);
        return tt >= hab.ranksMax ? 'maxed' : (tt > 0 ? 'ranked' : 'locked');
      }
      var r = Estado.rank(hab.id);
      if (hab.tipo === 'titulo') {
        return Regras.tituloDesbloqueado(hab) ? 'maxed' : 'locked';
      }
      if (r >= hab.ranksMax) { return 'maxed'; }
      if (r > 0)             { return 'ranked'; }
      return Regras.podeInvestir(hab) ? 'available' : 'locked';
    },

    tituloDesbloqueado: function (hab) {
      var aloc   = Estado.alocacao();
      var perfil = perfilPorId(hab.perfilId);
      if (!Regras.tierLiberado(perfil, hab.tier, aloc)) { return false; }
      return Regras.prereqsOk(hab, aloc);
    },

    /* Reconcilia a lista permanente de títulos com a alocação atual */
    sincronizarTitulos: function () {
      var novos = [];
      DADOS.perfis.forEach(function (p) {
        p.habilidades.forEach(function (h) {
          if (h.tipo !== 'titulo') { return; }
          if (Regras.tituloDesbloqueado(h) &&
              Estado.dados.titulos.indexOf(h.id) === -1) {
            Estado.dados.titulos.push(h.id);
            novos.push(h);
          }
        });
      });
      return novos;
    }
  };


  /* ============================================================
     3) RENDER
  ============================================================ */
  var UI = {

    refs: {},
    tipFixo: false,        // tooltip "preso" após clique no nó (popover)

    montarEsqueleto: function () {
      UI.refs.board   = $('#ttBoard');
      UI.refs.wallet  = $('#ttWallet');
      UI.refs.pages   = $('#ttPages');
      UI.refs.tabs    = $('#ttProfileTabs');
      UI.refs.panel   = $('#ttPanel');
      UI.refs.titles  = $('#ttTitles');
      UI.refs.tip     = $('#ttTip');
      UI.refs.toast   = $('#ttToast');
      UI.refs.status  = $('#ttStatus');
      UI.refs.btnSave = $('#ttSave');
      UI.refs.btnUndo = $('#ttUndo');
      UI.refs.btnWipe = $('#ttWipe');
    },

    /* ---------- carteira de pontos ---------- */
    renderWallet: function () {
      var w = UI.refs.wallet;
      w.innerHTML = '';
      DADOS.perfis.forEach(function (p) {
        var totais = Regras.pontosTotais(p.id);
        var gastos = Regras.pontosGastos(p.id);
        var livres = totais - gastos;
        var xp     = Regras.xpDoPerfil(p.id);
        var resto  = xp % XP_POR_PONTO;
        var pct    = Math.round((resto / XP_POR_PONTO) * 100);

        var item = el('div', 'tt-wallet__item');
        item.style.setProperty('--w-grad', UI.gradienteDe(p.id));
        item.innerHTML =
          '<span class="tt-wallet__icon"><span class="mdi ' + p.icone + '"></span></span>' +
          '<div class="tt-wallet__info">' +
            '<span class="tt-wallet__name">' + escapar(p.nome) + '</span>' +
            '<span class="tt-wallet__value"><b>' + livres + '</b> ponto(s) disponível(is) ' +
              '<span style="color:var(--udx-text-muted)">· ' + gastos + '/' + totais + ' investidos</span>' +
            '</span>' +
            '<span class="tt-wallet__xp">' + escapar(p.xpLabel) + ': ' + xp +
              ' &middot; faltam ' + (XP_POR_PONTO - resto) + ' XP para o próximo ponto</span>' +
            '<span class="tt-wallet__bar"><span class="tt-wallet__fill" style="width:' + pct + '%"></span></span>' +
          '</div>';
        w.appendChild(item);
      });
    },

    gradienteDe: function (perfilId) {
      var mapa = {
        bailarino: 'linear-gradient(135deg, #F20505 0%, #8C0783 100%)',
        professor: 'linear-gradient(135deg, #5708A6 0%, #430ABF 100%)',
        performer: 'linear-gradient(135deg, #FA33A1 0%, #F27405 100%)'
      };
      return mapa[perfilId] || 'var(--seg-grad)';
    },
    acentoDe: function (perfilId) {
      var mapa = { bailarino: '#F20505', professor: '#430ABF', performer: '#FA33A1' };
      return mapa[perfilId] || 'var(--seg-accent)';
    },
    glowDe: function (perfilId) {
      var mapa = {
        bailarino: 'rgba(242, 5, 5, .34)',
        professor: 'rgba(67, 10, 191, .38)',
        performer: 'rgba(250, 51, 161, .34)'
      };
      return mapa[perfilId] || 'var(--seg-glow)';
    },

    /* ---------- páginas de plano ---------- */
    renderPages: function () {
      var c = UI.refs.pages;
      c.innerHTML = '';
      Estado.dados.paginas.forEach(function (pg) {
        var b = el('button', 'tt-page-btn', String(pg.id));
        b.type = 'button';
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-selected', pg.id === Estado.dados.paginaAtual ? 'true' : 'false');
        b.title = pg.nome;
        b.addEventListener('click', function () {
          Estado.dados.paginaAtual = pg.id;
          UI.renderTudo();
        });
        c.appendChild(b);
      });

      if (Estado.dados.paginas.length < MAX_PAGINAS) {
        var add = el('button', 'tt-page-btn tt-page-btn--add', '+');
        add.type = 'button';
        add.title = 'Criar nova página de plano';
        add.setAttribute('aria-label', 'Criar nova página de plano');
        add.addEventListener('click', function () {
          var novoId = Estado.dados.paginas.length + 1;
          Estado.dados.paginas.push({
            id: novoId,
            nome: 'Plano 0' + novoId,
            alocacao: {}
          });
          Estado.dados.paginaAtual = novoId;
          UI.renderTudo();
          UI.toast('Página "Plano 0' + novoId + '" criada.');
        });
        c.appendChild(add);
      }
    },

    /* ---------- abas de perfil (mobile/tablet) ---------- */
    perfilVisivel: 'bailarino',

    renderTabs: function () {
      var c = UI.refs.tabs;
      c.innerHTML = '';
      DADOS.perfis.forEach(function (p) {
        var b = el('button', 'tt-profile-tab',
          '<span class="mdi ' + p.icone + '"></span><span>' + escapar(p.nome) + '</span>');
        b.type = 'button';
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-selected', p.id === UI.perfilVisivel ? 'true' : 'false');
        b.style.setProperty('--tab-grad', UI.gradienteDe(p.id));
        b.style.setProperty('--tab-glow', UI.glowDe(p.id));
        b.addEventListener('click', function () {
          UI.perfilVisivel = p.id;
          UI.renderTabs();
          UI.aplicarVisibilidade();
        });
        c.appendChild(b);
      });
    },

    aplicarVisibilidade: function () {
      $$('.tt-tree', UI.refs.board).forEach(function (t) {
        t.classList.toggle('is-hidden', t.getAttribute('data-perfil') !== UI.perfilVisivel);
      });
      UI.desenharConectores();
    },

    /* ---------- árvores ---------- */
    renderBoard: function () {
      var b = UI.refs.board;
      b.innerHTML = '';
      DADOS.perfis.forEach(function (p) { b.appendChild(UI.renderTree(p)); });
      UI.aplicarVisibilidade();
    },

    renderTree: function (perfil) {
      var gastos = Regras.pontosGastos(perfil.id);
      var totais = Regras.pontosTotais(perfil.id);

      var tree = el('section', 'tt-tree');
      tree.setAttribute('data-perfil', perfil.id);
      tree.setAttribute('aria-label', 'Árvore de talentos — ' + perfil.nome);

      /* cabeçalho */
      var head = el('div', 'tt-tree__head');
      head.innerHTML =
        '<span class="tt-tree__icon"><span class="mdi ' + perfil.icone + '"></span></span>' +
        '<div class="tt-tree__title">' +
          '<span>' + escapar(perfil.segmento) + '</span>' +
          '<h3>' + escapar(perfil.nome) + '</h3>' +
        '</div>' +
        '<span class="tt-tree__count"><b>' + gastos + '</b> / ' + totais + '</span>';
      tree.appendChild(head);

      /* canvas com conectores + faixas */
      var canvas = el('div', 'tt-tree__canvas');
      var svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'tt-links');
      svg.setAttribute('aria-hidden', 'true');
      canvas.appendChild(svg);

      perfil.tiers.forEach(function (t) {
        var habs = perfil.habilidades.filter(function (h) { return h.tier === t.n; })
          .sort(function (a, b) { return a.col - b.col; });   // ordem da grade = ordem das colunas
        if (!habs.length) { return; }

        var aberto = Regras.tierLiberado(perfil, t.n);
        var faixa  = el('div', 'tt-tier' + (aberto ? ' is-open' : ''));
        faixa.setAttribute('data-tier', t.n);
        faixa.innerHTML =
          '<div class="tt-tier__head">' +
            '<span class="tt-tier__n">' + t.n + '</span>' +
            '<span class="tt-tier__name">' + escapar(t.nome) + '</span>' +
            '<span class="tt-tier__req"><span class="mdi mdi-lock-outline"></span>' +
              t.requisito + ' pts</span>' +
          '</div>';

        var row = el('div', 'tt-tier__row');
        habs.forEach(function (h) { row.appendChild(UI.renderNode(h)); });
        faixa.appendChild(row);
        canvas.appendChild(faixa);
      });

      tree.appendChild(canvas);
      return tree;
    },

    renderNode: function (hab) {
      var wrap = el('div');
      wrap.style.gridColumn = String(hab.col);
      wrap.style.position   = 'relative';
      wrap.style.display    = 'flex';
      wrap.style.justifyContent = 'center';

      var estado = Regras.estadoDoNo(hab);
      var rank   = Estado.rank(hab.id);

      var trans = hab.tipo === 'transversal';
      if (trans) { rank = UI.tierConquistado(hab.titulo); }
      var btn = el('button', 'tt-node is-' + estado +
        (hab.tipo === 'titulo' ? ' tt-node--titulo' : '') + (trans ? ' tt-node--trans' : ''));
      btn.type = 'button';
      btn.setAttribute('data-hab', hab.id);
      btn.setAttribute('aria-label', trans
        ? hab.nome + ' — título transversal, ' + (rank ? 'tier ' + ['', 'I', 'II', 'III'][rank] : 'bloqueado')
        : hab.nome + ' — nível ' + rank + ' de ' + hab.ranksMax);
      btn.innerHTML = '<span class="mdi ' + (trans && !rank ? 'mdi-lock-outline' : hab.icone) + '"></span>' +
        (hab.tipo === 'titulo'
          ? ''
          : trans
            ? '<span class="tt-node__rank">' + (rank ? ['', 'I', 'II', 'III'][rank] : '—') + '</span>'
            : '<span class="tt-node__rank">' + rank + '/' + hab.ranksMax + '</span>');

      var label = el('span', 'tt-node__label', escapar(hab.nome));

      wrap.appendChild(btn);
      wrap.appendChild(label);
      return wrap;
    },

    /* ---------- conectores SVG ---------- */
    desenharConectores: function () {
      $$('.tt-tree', UI.refs.board).forEach(function (tree) {
        var canvas = $('.tt-tree__canvas', tree);
        var svg    = $('.tt-links', tree);
        if (!canvas || !svg) { return; }

        var box = canvas.getBoundingClientRect();
        if (!box.width) { return; }

        svg.setAttribute('viewBox', '0 0 ' + box.width + ' ' + box.height);
        svg.setAttribute('width', box.width);
        svg.setAttribute('height', box.height);
        while (svg.firstChild) { svg.removeChild(svg.firstChild); }

        var perfil = perfilPorId(tree.getAttribute('data-perfil'));
        perfil.habilidades.forEach(function (hab) {
          if (!hab.requer.length) { return; }
          var alvo = $('[data-hab="' + hab.id + '"]', tree);
          if (!alvo) { return; }
          var bAlvo = alvo.getBoundingClientRect();

          hab.requer.forEach(function (reqId) {
            var origem = $('[data-hab="' + reqId + '"]', tree);
            if (!origem) { return; }
            var bOrig = origem.getBoundingClientRect();

            var x1 = bOrig.left - box.left + bOrig.width / 2;
            var y1 = bOrig.top  - box.top  + bOrig.height;
            var x2 = bAlvo.left - box.left + bAlvo.width / 2;
            var y2 = bAlvo.top  - box.top;
            var mid = y1 + (y2 - y1) / 2;

            var path = doc.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d',
              'M ' + x1 + ' ' + y1 +
              ' C ' + x1 + ' ' + mid + ', ' + x2 + ' ' + mid + ', ' + x2 + ' ' + y2);

            var pr    = DADOS.indice[reqId];
            var ativo = pr && Estado.rank(reqId) >= pr.ranksMax;
            path.setAttribute('class', 'tt-link' + (ativo ? ' is-active' : ''));
            svg.appendChild(path);
          });
        });
      });
    },

    /* ---------- painel de desafios ---------- */
    habSelecionada: null,

    renderPanel: function () {
      var p = UI.refs.panel;
      var hab = UI.habSelecionada ? DADOS.indice[UI.habSelecionada] : null;

      if (!hab) {
        p.innerHTML =
          '<div class="tt-panel__empty">' +
            '<span class="mdi mdi-gesture-tap-button"></span>' +
            'Selecione uma habilidade na árvore para ver os desafios que geram ' +
            'experiência para ela.' +
          '</div>';
        return;
      }

      var perfil = perfilPorId(hab.perfilId);
      var rank   = Estado.rank(hab.id);

      if (hab.tipo === 'transversal') { UI.renderPanelTransversal(p, hab, perfil); return; }

      p.style.setProperty('--panel-grad',   UI.gradienteDe(perfil.id));
      p.style.setProperty('--panel-accent', UI.acentoDe(perfil.id));
      p.style.setProperty('--panel-glow',   UI.glowDe(perfil.id));

      var html =
        '<div class="tt-panel__head">' +
          '<span class="tt-panel__icon"><span class="mdi ' + hab.icone + '"></span></span>' +
          '<div class="tt-panel__title">' +
            '<span>' + escapar(perfil.nome) + ' &middot; ' +
              escapar(tierDe(perfil, hab.tier).nome) + '</span>' +
            '<h3>' + escapar(hab.nome) + '</h3>' +
          '</div>' +
          '<span class="tt-chip"><span class="mdi mdi-star-four-points-outline"></span>' +
            'Nível ' + rank + '/' + hab.ranksMax + '</span>' +
        '</div>';

      if (!hab.desafios.length) {
        html += '<div class="tt-panel__empty">Nenhum desafio cadastrado para esta habilidade.</div>';
        p.innerHTML = html;
        return;
      }

      html += '<ul class="tt-challenges">';
      hab.desafios.forEach(function (d) {
        if (d.multi) { html += UI.itemMultiestilo(d); return; }
        var feito = Estado.dados.desafios.indexOf(d.id) !== -1;
        var meta  = DADOS.tiposDesafio[d.tipo] || DADOS.tiposDesafio.tarefa;
        html +=
          '<li class="tt-challenge' + (feito ? ' is-done' : '') + '">' +
            '<span class="tt-challenge__mark">' +
              '<span class="mdi ' + (feito ? 'mdi-check-bold' : meta.icone) + '"></span>' +
            '</span>' +
            '<div class="tt-challenge__body">' +
              '<span class="tt-challenge__name">' + escapar(d.nome) + '</span>' +
              '<p class="tt-challenge__desc">' + escapar(d.desc) + '</p>' +
              '<div class="tt-challenge__meta">' +
                '<span class="tt-chip"><span class="mdi ' + meta.icone + '"></span>' +
                  escapar(meta.label) + '</span>' +
                (d.xp > 0
                  ? '<span class="tt-chip tt-chip--xp"><span class="mdi mdi-lightning-bolt"></span>+' +
                    d.xp + ' XP</span>'
                  : '') +
              '</div>' +
            '</div>' +
            '<button type="button" class="tt-challenge__cta" data-desafio="' + escapar(d.id) + '"' +
              (feito ? ' disabled' : '') + '>' +
              '<span class="mdi ' + (feito ? 'mdi-check-circle-outline' : 'mdi-upload-outline') + '"></span>' +
              (feito ? 'Concluído' : 'Enviar comprovação') +
            '</button>' +
          '</li>';
      });
      html += '</ul>';

      p.innerHTML = html;
    },

    /* ---------- nó transversal (tier por notas) ---------- */
    desafiosDoGrupo: function (hab) {
      var origem = DADOS.indice[(hab.requer || [])[0]];
      return origem ? origem.desafios.filter(function (d) { return d.multi === hab.grupo; }) : [];
    },

    progressoTransversal: function (hab) {
      var tier = UI.tierConquistado(hab.titulo);
      var ling = UI.linguagensDoGrupo(hab.grupo);
      var rom  = ['', 'I', 'II', 'III'];
      var html = '<div class="tt-trans__ling" aria-label="Linguagens">' + MULTI.estilos.map(function (e) {
        var l = ling[e.id];
        var cls = !l ? '' : l.status === 'aprovado' ? ' is-ok' : ' is-pend';
        var txt = !l ? '' : l.status === 'aprovado' ? (l.nota != null ? ' · ' + l.nota : ' · sem nota') : ' · em validação';
        return '<span class="tt-trans__l' + cls + '">' + escapar(e.nome) + txt + '</span>';
      }).join('') + '</div>';
      var prox = null;
      MULTI.tiers.forEach(function (tt) { if (!prox && tt.n > tier) { prox = tt; } });
      if (prox) {
        var tem = Object.keys(ling).filter(function (x) {
          return ling[x].status === 'aprovado' && ling[x].nota != null && ling[x].nota > prox.notaAcima;
        }).length;
        html += '<p class="tt-trans__prox">Próximo: <b>tier ' + rom[prox.n] + '</b>, ' + prox.estilos +
          ' linguagens com nota acima de ' + prox.notaAcima + ' (você tem ' + tem + ').</p>';
      } else {
        html += '<p class="tt-trans__prox"><b>Tier máximo conquistado.</b></p>';
      }
      return html;
    },

    renderPanelTransversal: function (p, hab, perfil) {
      var tier = UI.tierConquistado(hab.titulo);
      var rom  = ['', 'I', 'II', 'III'];
      p.style.setProperty('--panel-grad',   UI.gradienteDe(perfil.id));
      p.style.setProperty('--panel-accent', UI.acentoDe(perfil.id));
      p.style.setProperty('--panel-glow',   UI.glowDe(perfil.id));
      p.style.setProperty('--trans-cor',    UI.acentoDe(perfil.id));
      var html =
        '<div class="tt-panel__head">' +
          '<span class="tt-panel__icon"><span class="mdi ' + hab.icone + '"></span></span>' +
          '<div class="tt-panel__title">' +
            '<span>' + escapar(perfil.nome) + ' &middot; Título transversal</span>' +
            '<h3>' + escapar(hab.nome) + (hab.nomeF && hab.nomeF !== hab.nome ? ' / ' + escapar(hab.nomeF) : '') + '</h3>' +
          '</div>' +
          '<span class="tt-chip"><span class="mdi ' + (tier ? 'mdi-shield-star' : 'mdi-lock-outline') + '"></span>' +
            (tier ? 'Tier ' + rom[tier] : 'Bloqueado') + '</span>' +
        '</div>' +
        '<p class="tt-trans__desc" style="margin:0 0 10px">' + escapar(hab.resumo) +
          ' Sobe de tier pelas notas das vagas abaixo; não recebe pontos.</p>' +
        '<div class="tt-trans__painel">' + UI.progressoTransversal(hab) + '</div>' +
        '<ul class="tt-challenges">' + UI.desafiosDoGrupo(hab).map(function (d) { return UI.itemMultiestilo(d); }).join('') + '</ul>';
      p.innerHTML = html;
    },

    /* ---------- desafios multiestilo ---------- */
    escolhas: {},          // desafioId -> [estilos] escolhidos antes de enviar

    /* Linguagens já usadas em outras vagas do mesmo grupo (só grupos de 1 linguagem). */
    estilosUsados: function (d) {
      var g = MULTI.grupos[d.multi], usados = {};
      if (!g || g.max !== 1) { return usados; }
      Object.keys(Estado.dados.envios).forEach(function (id) {
        if (id === d.id || id.indexOf('mx-' + d.multi + '-') !== 0) { return; }
        var e = Estado.dados.envios[id];
        if (e.status === 'pendente' || e.status === 'aprovado') {
          e.estilos.forEach(function (x) { usados[x] = true; });
        }
      });
      return usados;
    },

    itemMultiestilo: function (d) {
      var g     = MULTI.grupos[d.multi] || { min: 1, max: 1 };
      var envio = Estado.dados.envios[d.id] || null;
      var st    = envio ? envio.status : '';
      var feito = st === 'aprovado' || Estado.dados.desafios.indexOf(d.id) !== -1;
      var meta  = DADOS.tiposDesafio[d.tipo] || DADOS.tiposDesafio.tarefa;
      var nomes = function (lista) { return lista.map(function (x) { return NOME_ESTILO[x] || x; }).join(' + '); };
      var html =
        '<li class="tt-challenge tt-challenge--mx' + (feito ? ' is-done' : '') + '">' +
          '<span class="tt-challenge__mark"><span class="mdi ' + (feito ? 'mdi-check-bold' : meta.icone) + '"></span></span>' +
          '<div class="tt-challenge__body">' +
            '<span class="tt-challenge__name">' + escapar(d.nome) + '</span>' +
            '<p class="tt-challenge__desc">' + escapar(d.desc) + '</p>' +
            '<div class="tt-challenge__meta">' +
              '<span class="tt-chip"><span class="mdi ' + meta.icone + '"></span>' + escapar(meta.label) + '</span>' +
              (d.xp > 0 ? '<span class="tt-chip tt-chip--xp"><span class="mdi mdi-lightning-bolt"></span>+' + d.xp + ' XP</span>' : '') +
              '<span class="tt-chip"><span class="mdi mdi-earth"></span>Multiestilo</span>' +
            '</div>';
      if (st === 'aprovado' || st === 'pendente') {
        html += '<p class="tt-mx__status">' +
          (st === 'aprovado' ? 'Aprovado em ' : 'Aguardando validação · ') +
          '<b>' + escapar(nomes(envio.estilos)) + '</b></p>';
      } else {
        var escolha = UI.escolhas[d.id] || [];
        var usados  = UI.estilosUsados(d);
        html += '<div class="tt-mx" role="group" aria-label="' +
          escapar(g.max === 1 ? 'Linguagem do envio' : 'Linguagens do envio (' + g.min + ' a ' + g.max + ')') + '">' +
          '<span class="tt-mx__rot">' + (g.max === 1 ? 'Linguagem:' : 'Linguagens (' + g.min + ' a ' + g.max + '):') + '</span>' +
          MULTI.estilos.map(function (e) {
            var usado = !!usados[e.id];
            var on    = escolha.indexOf(e.id) !== -1;
            return '<button type="button" class="tt-mx__btn" data-mx-desafio="' + escapar(d.id) + '" data-mx-estilo="' + e.id + '"' +
              ' aria-pressed="' + on + '"' + (usado ? ' disabled title="Já usada em outra vaga"' : '') + '>' +
              escapar(e.nome) + '</button>';
          }).join('') +
          '</div>' +
          (st === 'recusado' ? '<p class="tt-mx__status">Recusado pela coordenação. Você pode reenviar.</p>' : '');
      }
      var pronto = (UI.escolhas[d.id] || []).length >= g.min && (UI.escolhas[d.id] || []).length <= g.max;
      var bloqueado = feito || st === 'pendente' || !pronto;
      html += '</div>' +
          '<button type="button" class="tt-challenge__cta" data-desafio="' + escapar(d.id) + '"' + (bloqueado ? ' disabled' : '') + '>' +
            '<span class="mdi ' + (feito ? 'mdi-check-circle-outline' : st === 'pendente' ? 'mdi-timer-sand' : 'mdi-upload-outline') + '"></span>' +
            (feito ? 'Concluído' : st === 'pendente' ? 'Em validação' : st === 'recusado' ? 'Reenviar' : 'Enviar comprovação') +
          '</button>' +
        '</li>';
      return html;
    },

    alternarEstilo: function (desafioId, estilo) {
      var d = null;
      DADOS.perfis.some(function (p) {
        return p.habilidades.some(function (h) {
          return h.desafios.some(function (x) { if (x.id === desafioId) { d = x; return true; } return false; });
        });
      });
      if (!d || !d.multi) { return; }
      var g = MULTI.grupos[d.multi] || { max: 1 };
      var atual = (UI.escolhas[desafioId] || []).slice();
      var i = atual.indexOf(estilo);
      if (i !== -1) { atual.splice(i, 1); }
      else if (g.max === 1) { atual = [estilo]; }
      else if (atual.length < g.max) { atual.push(estilo); }
      else { UI.toast('Escolha no máximo ' + g.max + ' linguagens.', true); return; }
      UI.escolhas[desafioId] = atual;
      UI.renderPanel();
      var b = UI.refs.panel.querySelector('[data-mx-desafio="' + desafioId + '"][data-mx-estilo="' + estilo + '"]');
      if (b) { b.focus(); }
    },

    /* ---------- títulos ---------- */
    renderTitles: function () {
      var c = UI.refs.titles;
      c.innerHTML = '';
      DADOS.perfis.forEach(function (p) {
        p.habilidades.forEach(function (h) {
          if (h.tipo !== 'titulo') { return; }
          var conquistado = Estado.dados.titulos.indexOf(h.id) !== -1;
          var li = el('li', 'tt-title-card' + (conquistado ? '' : ' is-locked'));
          li.innerHTML =
            '<span class="tt-title-card__icon">' +
              '<span class="mdi ' + (conquistado ? h.icone : 'mdi-lock-outline') + '"></span>' +
            '</span>' +
            '<div class="tt-title-card__body">' +
              '<b>' + escapar(h.nome) + '</b>' +
              '<span>' + (conquistado
                ? 'Conquistado &middot; ' + escapar(p.nome)
                : 'Requer ' + escapar(h.requer.map(function (id) {
                    return DADOS.indice[id] ? DADOS.indice[id].nome : id;
                  }).join(' + ')) + ' no nível máximo') +
              '</span>' +
            '</div>';
          c.appendChild(li);
        });
      });
    },

    /* ---------- títulos transversais (catálogo em /js/titulos.data.js) ---------- */
    transCaixa: function () {
      var c = $('#ttTransTitles');
      if (c || !UI.refs.titles) { return c; }
      c = el('div', 'tt-trans');
      c.id = 'ttTransTitles';
      c.innerHTML =
        '<div class="tt-trans__head">' +
          '<h3><span class="mdi mdi-shield-star-outline" aria-hidden="true"></span>Títulos transversais de desempenho</h3>' +
          '<p>Vêm das avaliações de desempenho e cruzam perfis. Os títulos multiestilo estão nas árvores, ' +
          'na faixa Título, ao lado do título de carreira.</p>' +
        '</div>' +
        '<ul class="tt-titles tt-trans__lista" id="ttTransList"></ul>';
      UI.refs.titles.parentNode.insertBefore(c, UI.refs.titles.nextSibling);
      return c;
    },

    /* Maior tier conquistado de um título (ids '<id>-<n>' ou o id puro = conquistado). */
    tierConquistado: function (id) {
      var max = 0;
      Estado.dados.repTitulos.forEach(function (t) {
        if (t === id) { max = Math.max(max, 3); return; }
        var m = /^(.*)-([123])$/.exec(t);
        if (m && m[1] === id) { max = Math.max(max, Number(m[2])); }
      });
      return max;
    },

    /* Linguagens de um grupo multiestilo: { pop: { nota, status } } — melhor envio por linguagem. */
    linguagensDoGrupo: function (grupo) {
      var out = {};
      Object.keys(Estado.dados.envios).forEach(function (id) {
        if (id.indexOf('mx-' + grupo + '-') !== 0) { return; }
        var e = Estado.dados.envios[id];
        if (e.status !== 'aprovado' && e.status !== 'pendente') { return; }
        e.estilos.forEach(function (x) {
          var atual = out[x];
          var novo = { status: e.status, nota: e.status === 'aprovado' ? e.nota : null };
          if (!atual || (novo.status === 'aprovado' && (atual.status !== 'aprovado' || (novo.nota || 0) > (atual.nota || 0)))) {
            out[x] = novo;
          }
        });
      });
      return out;
    },

    renderTransversais: function () {
      var T = win.UDX_TITULOS;
      var caixa = UI.transCaixa();
      if (!caixa) { return; }
      var lista = $('#ttTransList', caixa);
      if (!T || !T.transversais) {
        lista.innerHTML = '<li class="tt-trans__vazio">' + (UI.catalogoTitulosFalhou
          ? 'Não foi possível carregar os títulos transversais agora.'
          : 'Carregando os títulos transversais…') + '</li>';
        return;
      }
      var grupoDoTitulo = {};
      Object.keys(MULTI.grupos).forEach(function (gid) { grupoDoTitulo[MULTI.grupos[gid].titulo] = gid; });
      var rom = ['', 'I', 'II', 'III'];
      /* Os multiestilo já são nós das árvores (faixa 5): aqui ficam só os demais. */
      var naArvore = {};
      Object.keys(DADOS.indice).forEach(function (id) {
        var h = DADOS.indice[id];
        if (h.tipo === 'transversal' && h.titulo) { naArvore[h.titulo] = true; }
      });

      lista.innerHTML = T.transversais.filter(function (t) { return !naArvore[t.id]; }).map(function (t) {
        var tier = UI.tierConquistado(t.id);
        var nomes = escapar(t.nome) + (t.nomeF && t.nomeF !== t.nome ? ' <small>/ ' + escapar(t.nomeF) + '</small>' : '');
        var head =
          '<div class="tt-trans__topo">' +
            '<span class="tt-title-card__icon"><span class="mdi ' + escapar(tier ? t.icone : 'mdi-lock-outline') + '"></span></span>' +
            '<div class="tt-title-card__body"><b>' + nomes + (tier ? ' ' + rom[tier] : '') + '</b>' +
              '<span>' + escapar(t.escopo || '') + '</span></div>' +
            '<span class="tt-trans__chip' + (tier ? ' is-ok' : '') + '">' + (tier ? 'Tier ' + rom[tier] : 'Bloqueado') + '</span>' +
          '</div>' +
          '<p class="tt-trans__desc">' + escapar(t.desc || '') + '</p>';

        var corpo = '';
        var gid = grupoDoTitulo[t.id];
        if (t.multiestilo && gid) {
          var ling = UI.linguagensDoGrupo(gid);
          corpo += '<div class="tt-trans__ling" aria-label="Linguagens">' + MULTI.estilos.map(function (e) {
            var l = ling[e.id];
            var cls = !l ? '' : l.status === 'aprovado' ? ' is-ok' : ' is-pend';
            var txt = !l ? '' : l.status === 'aprovado' ? (l.nota != null ? ' · ' + l.nota : ' · sem nota') : ' · em validação';
            return '<span class="tt-trans__l' + cls + '">' + escapar(e.nome) + txt + '</span>';
          }).join('') + '</div>';
          var prox = null;
          MULTI.tiers.forEach(function (tt) { if (!prox && tt.n > tier) { prox = tt; } });
          if (prox) {
            var tem = Object.keys(ling).filter(function (x) {
              return ling[x].status === 'aprovado' && ling[x].nota != null && ling[x].nota > prox.notaAcima;
            }).length;
            corpo += '<p class="tt-trans__prox">Próximo: <b>tier ' + rom[prox.n] + '</b>, ' + prox.estilos +
              ' linguagens com nota acima de ' + prox.notaAcima + ' (você tem ' + tem + ').</p>';
          } else {
            corpo += '<p class="tt-trans__prox"><b>Tier máximo conquistado.</b></p>';
          }
          var hab = DADOS.indice[t.habilidadeArvore];
          if (hab) {
            corpo += '<button type="button" class="tt-trans__ir" data-trans-hab="' + escapar(hab.id) + '">' +
              '<span class="mdi mdi-flag-checkered" aria-hidden="true"></span>Desafios em ' + escapar(hab.nome) + '</button>';
          }
        } else {
          corpo += '<ol class="tt-trans__tiers">' + (t.tiers || []).map(function (tt) {
            return '<li' + (tier >= tt.n ? ' class="is-ok"' : '') + '><b>' + rom[tt.n] + '</b>' + escapar(tt.regra) + '</li>';
          }).join('') + '</ol>';
        }
        return '<li class="tt-title-card tt-trans__card' + (tier ? '' : ' is-locked') + '" style="--trans-cor:' + escapar(t.cor || '#FA33A1') + '">' +
          head + corpo + '</li>';
      }).join('');
    },

    /* ---------- barra de status ---------- */
    renderStatus: function () {
      var s = UI.refs.status;
      if (!s) { return; }
      var sujo = Estado.sujo();
      s.textContent = sujo
        ? 'Alterações não salvas nesta página de plano.'
        : (Estado.online ? 'Plano sincronizado.' : 'Plano salvo apenas neste dispositivo.');
      s.style.color = sujo ? 'var(--udx-primary-hot)' : 'var(--udx-text-muted)';
      if (UI.refs.btnSave) { UI.refs.btnSave.disabled = !sujo; }
      if (UI.refs.btnUndo) { UI.refs.btnUndo.disabled = !sujo; }
    },

    renderTudo: function () {
      Regras.sincronizarTitulos();
      UI.renderWallet();
      UI.renderPages();
      UI.renderBoard();
      UI.renderPanel();
      UI.renderTitles();
      UI.renderTransversais();
      UI.renderStatus();
      win.requestAnimationFrame(UI.desenharConectores);
    },

    /* ---------- tooltip ---------- */
    mostrarTip: function (hab, alvo) {
      var tip    = UI.refs.tip;
      win.clearTimeout(UI.tipTimer);
      var perfil = perfilPorId(hab.perfilId);
      var rank   = Estado.rank(hab.id);
      var pend   = Regras.pendencias(hab);

      tip.style.setProperty('--tip-grad',   UI.gradienteDe(perfil.id));
      tip.style.setProperty('--tip-accent', UI.acentoDe(perfil.id));

      if (hab.tipo === 'transversal') {
        var tierT = UI.tierConquistado(hab.titulo), romT = ['', 'I', 'II', 'III'];
        var htmlT =
          '<div class="tt-tip__head">' +
            '<span class="tt-tip__icon"><span class="mdi ' + hab.icone + '"></span></span>' +
            '<div><h4 class="tt-tip__name">' + escapar(hab.nome) + '</h4>' +
              '<span class="tt-tip__tier">' + escapar(perfil.nome) + ' &middot; Título transversal</span></div>' +
            '<span class="tt-tip__rank">' + (tierT ? 'TIER ' + romT[tierT] : 'BLOQUEADO') + '</span>' +
          '</div>' +
          '<p class="tt-tip__resumo">' + escapar(hab.resumo) + '</p>';
        hab.niveis.forEach(function (n, i) {
          htmlT += '<p class="tt-tip__nivel' + (i + 1 > tierT ? ' tt-tip__nivel--next' : '') + '"><b>' +
            (i + 1 <= tierT ? 'Conquistado' : 'A conquistar') + '</b>' + escapar(n) + '</p>';
        });
        htmlT += UI.progressoTransversal(hab) +
          '<p class="tt-tip__hint">Sobe de tier pelas notas dos desafios; não recebe pontos. Clique no nó para abrir as vagas.</p>';
        tip.innerHTML = htmlT;
        tip.classList.add('is-open');
        tip.setAttribute('aria-hidden', 'false');
        UI.posicionarTip(alvo);
        return;
      }

      var html =
        '<div class="tt-tip__head">' +
          '<span class="tt-tip__icon"><span class="mdi ' + hab.icone + '"></span></span>' +
          '<div>' +
            '<h4 class="tt-tip__name">' + escapar(hab.nome) + '</h4>' +
            '<span class="tt-tip__tier">' + escapar(perfil.nome) + ' &middot; ' +
              escapar(tierDe(perfil, hab.tier).nome) + '</span>' +
          '</div>' +
          (hab.tipo === 'titulo'
            ? '<span class="tt-tip__rank">TÍTULO</span>'
            : '<span class="tt-tip__rank">' + rank + '/' + hab.ranksMax + '</span>') +
        '</div>' +
        '<p class="tt-tip__resumo">' + escapar(hab.resumo) + '</p>';

      if (rank > 0 && hab.niveis[rank - 1]) {
        html += '<p class="tt-tip__nivel"><b>Nível ' + rank + ' — atual</b>' +
                escapar(hab.niveis[rank - 1]) + '</p>';
      }
      if (rank < hab.ranksMax && hab.niveis[rank]) {
        html += '<p class="tt-tip__nivel tt-tip__nivel--next"><b>Nível ' + (rank + 1) +
                ' — próximo</b>' + escapar(hab.niveis[rank]) + '</p>';
      }
      pend.forEach(function (p) {
        html += '<p class="tt-tip__req"><span class="mdi mdi-lock-outline"></span>' +
                escapar(p) + '</p>';
      });
      if (hab.desafios.length) {
        html += '<p class="tt-tip__hint">' + hab.desafios.length +
                ' desafio(s) geram ' + escapar(perfil.xpLabel) + ' para esta habilidade. ' +
                'Clique no nó para abrir a lista.</p>';
      }
      if (hab.tipo !== 'titulo') {
        html += '<p class="tt-tip__hint">Clique: +1 nível &middot; ' +
                'Clique direito (ou Alt+clique): −1 nível</p>';
      }

       var destinoDesafios = '/membros/desafios/?arvore=' + encodeURIComponent(ARVORE) +
                            '&hab=' + encodeURIComponent(hab.id);
      html += '<a class="tt-tip__go" href="' + escapar(destinoDesafios) + '" data-hab="' + escapar(hab.id) + '">' +
                '<span class="mdi mdi-flag-checkered" aria-hidden="true"></span>' +
                'Ir para os desafios</a>';

      tip.innerHTML = html;
      tip.classList.add('is-open');
      tip.setAttribute('aria-hidden', 'false');
      UI.posicionarTip(alvo);
    },

    posicionarTip: function (alvo) {
      var tip = UI.refs.tip;
      var b   = alvo.getBoundingClientRect();
      var t   = tip.getBoundingClientRect();
      var m   = 12;

      var left = b.left + b.width / 2 - t.width / 2;
      left = Math.max(m, Math.min(left, win.innerWidth - t.width - m));

      var top = b.bottom + 10;
      if (top + t.height > win.innerHeight - m) {
        top = b.top - t.height - 10;
      }
      top = Math.max(m, top);

      tip.style.left = left + 'px';
      tip.style.top  = top + 'px';
    },

    esconderTip: function () {
      var tip = UI.refs.tip;
      win.clearTimeout(UI.tipTimer);
      UI.tipFixo = false;
      var ae = doc.activeElement;                 // nunca ocultar (aria-hidden) um descendente focado
      if (ae && tip.contains(ae) && ae.blur) { ae.blur(); }
      tip.classList.remove('is-open');
      tip.setAttribute('aria-hidden', 'true');
    },

    /* Rola até a âncora #desafios compensando a altura REAL da topbar fixa
       (no mobile ela quebra em 2 linhas e fica bem mais alta que no desktop). */
    irParaDesafios: function () {
      var alvo = doc.getElementById('desafios');
      if (!alvo) { return; }
      var bar = doc.querySelector('.members-topbar');
      var off = (bar ? bar.getBoundingClientRect().height : 60) + 12;
      var y = alvo.getBoundingClientRect().top + (win.pageYOffset || 0) - off;
      if (y < 0) { y = 0; }
      if (win.scrollTo) { win.scrollTo({ top: y, behavior: 'smooth' }); }
      else { win.scroll(0, y); }
    },

    pedirEsconderTip: function () {
      if (UI.tipFixo) { return; }                 // popover fixado não fecha por mouseout
      win.clearTimeout(UI.tipTimer);
      UI.tipTimer = win.setTimeout(function () { UI.esconderTip(); }, 260);
    },

    /* ---------- toast ---------- */
    toast: function (msg, erro) {
      var t = UI.refs.toast;
      t.innerHTML = '<span class="mdi ' +
        (erro ? 'mdi-alert-circle-outline' : 'mdi-check-circle-outline') + '"></span>' +
        '<span>' + escapar(msg) + '</span>';
      t.classList.toggle('is-error', !!erro);
      t.classList.add('is-open');
      win.clearTimeout(UI.toastTimer);
      UI.toastTimer = win.setTimeout(function () { t.classList.remove('is-open'); }, 3400);
    }
  };


  /* ============================================================
     4) AÇÕES
  ============================================================ */
  var Acoes = {

    investir: function (hab) {
      if (hab.tipo === 'transversal') { return; }      // sobe por notas; o clique só abre o painel
      if (hab.tipo === 'titulo') {
        UI.toast('Títulos não recebem pontos — são liberados ao completar a faixa.', true);
        return;
      }
      if (!Regras.podeInvestir(hab)) {
        var pend = Regras.pendencias(hab);
        if (pend.length) { UI.toast(pend[0], true); }
        else if (Estado.rank(hab.id) >= hab.ranksMax) {
          UI.toast(hab.nome + ' já está no nível máximo.', true);
        } else {
          UI.toast('Sem pontos disponíveis em ' +
            perfilPorId(hab.perfilId).nome + '. Conclua desafios para ganhar XP.', true);
        }
        return;
      }
      var aloc = Estado.alocacao();
      aloc[hab.id] = (aloc[hab.id] || 0) + 1;

      var novos = Regras.sincronizarTitulos();
      UI.renderTudo();
      if (novos.length) {
        UI.toast('Título desbloqueado: ' + novos[0].nome + '!');
      }
    },

    remover: function (hab) {
      if (!Regras.podeRemover(hab)) {
        if (!Estado.rank(hab.id)) { return; }
        UI.toast('Outra habilidade depende deste nível. Remova-a primeiro.', true);
        return;
      }
      var aloc = Estado.alocacao();
      aloc[hab.id] -= 1;
      if (aloc[hab.id] === 0) { delete aloc[hab.id]; }
      UI.renderTudo();
    },

    zerar: function () {
      if (!win.confirm('Resumir todos os pontos desta página de plano?')) { return; }
      Estado.pagina().alocacao = {};
      UI.renderTudo();
      UI.toast('Pontos resumidos nesta página.');
    },

    reverter: function () {
      if (!Estado.sujo()) { return; }
      Estado.dados.paginas = JSON.parse(Estado.limpo);
      UI.renderTudo();
      UI.toast('Alterações revertidas para a última versão salva.');
    },

    salvar: function () {
      var payload = {
        paginaAtual: Estado.dados.paginaAtual,
        paginas:     Estado.dados.paginas
      };

      Estado.gravarLocal();

      fetch(API.salvar, {
        method:      'POST',
        credentials: 'same-origin',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify(payload)
      })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) {
          if (!j || j.ok !== true) { throw new Error('recusado'); }
          Estado.online = true;
          Estado.limpo  = JSON.stringify(Estado.dados.paginas);
          UI.renderStatus();
          UI.toast('Plano salvo.');
        })
        .catch(function () {
          Estado.online = false;
          Estado.limpo  = JSON.stringify(Estado.dados.paginas);
          UI.renderStatus();
          UI.toast('Plano salvo neste dispositivo — sincroniza quando você reconectar.');
        });
    },

    /* Envio de comprovação de desafio.
       Em produção o XP só é creditado após validação da coordenação;
       o Worker devolve o novo saldo, que substitui o local. */
    enviarDesafio: function (desafioId) {
      var hab = null, desafio = null;
      DADOS.perfis.some(function (p) {
        return p.habilidades.some(function (h) {
          return h.desafios.some(function (d) {
            if (d.id === desafioId) { hab = h; desafio = d; return true; }
            return false;
          });
        });
      });
      if (!hab || !desafio) { return; }
      if (Estado.dados.desafios.indexOf(desafioId) !== -1) { return; }

      var estilos = desafio.multi ? (UI.escolhas[desafioId] || []).slice() : null;
      if (desafio.multi) {
        var g = MULTI.grupos[desafio.multi] || { min: 1, max: 1 };
        if (estilos.length < g.min || estilos.length > g.max) {
          UI.toast(g.max === 1 ? 'Escolha a linguagem do envio.' : 'Escolha de ' + g.min + ' a ' + g.max + ' linguagens.', true);
          UI.renderPanel();
          return;
        }
      }
      var corpo = { desafio: desafioId, habilidade: hab.id };
      if (estilos) { corpo.estilos = estilos; }

      fetch(API.desafio, {
        method:      'POST',
        credentials: 'same-origin',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify(corpo)
      })
        .then(function (r) {
          /* Recusa do servidor com motivo (ex.: linguagem repetida) não cai no modo local. */
          if (!r.ok) {
            return r.json().catch(function () { return null; }).then(function (e) {
              if (e && e.erro) { var x = new Error(e.erro); x.servidor = true; throw x; }
              return null;
            });
          }
          return r.json();
        })
        .then(function (j) {
          if (!j || j.ok !== true) { throw new Error('sem worker'); }
          Estado.online = true;
          if (j.status === 'pendente') {
            if (estilos) {
              Estado.dados.envios[desafioId] = { status: 'pendente', estilos: estilos };
              delete UI.escolhas[desafioId];
              UI.renderPanel();
            }
            UI.toast('Comprovação enviada. A coordenação valida em até 48h.');
            return;
          }
          if (j.xp) {
            DADOS.perfis.forEach(function (p) {
              if (typeof j.xp[p.id] === 'number') { Estado.dados.xp[p.id] = j.xp[p.id]; }
            });
          }
          if (Estado.dados.desafios.indexOf(desafioId) === -1) {
            Estado.dados.desafios.push(desafioId);
          }
          Estado.gravarLocal();
          UI.renderTudo();
          UI.toast('Desafio validado: +' + desafio.xp + ' ' + perfilPorId(hab.perfilId).xpLabel + '.');
        })
        .catch(function (err) {
          if (err && err.servidor) {
            UI.toast(err.message, true);
            UI.renderPanel();
            return;
          }
          /* Sem Worker: modo local. Credita para permitir navegar o sistema. */
          Estado.online = false;
          if (estilos) { Estado.dados.envios[desafioId] = { status: 'aprovado', estilos: estilos }; }
          Estado.dados.desafios.push(desafioId);
          Estado.dados.xp[hab.perfilId] =
            (Estado.dados.xp[hab.perfilId] || 0) + (desafio.xp || 0);
          Estado.gravarLocal();
          UI.renderTudo();
          UI.toast('Desafio registrado localmente: +' + desafio.xp + ' XP.');
        });
    }
  };


  /* ============================================================
     5) EVENTOS
  ============================================================ */
  function ligarEventos() {

    /* --- clique / clique-direito nos nós --- */
    UI.refs.board.addEventListener('click', function (ev) {
      var btn = ev.target.closest('.tt-node');
      if (!btn) { return; }
      var hab = DADOS.indice[btn.getAttribute('data-hab')];
      if (!hab) { return; }

      UI.habSelecionada = hab.id;

      if (ev.altKey || ev.metaKey) { Acoes.remover(hab); }
      else                         { Acoes.investir(hab); }

      UI.renderPanel();
      var novo = $('[data-hab="' + hab.id + '"]', UI.refs.board);
      if (novo) { UI.tipFixo = true; UI.mostrarTip(hab, novo); }
    });

    UI.refs.board.addEventListener('contextmenu', function (ev) {
      var btn = ev.target.closest('.tt-node');
      if (!btn) { return; }
      ev.preventDefault();
      var hab = DADOS.indice[btn.getAttribute('data-hab')];
      if (!hab) { return; }
      UI.habSelecionada = hab.id;
      Acoes.remover(hab);
      UI.renderPanel();
      var novo = $('[data-hab="' + hab.id + '"]', UI.refs.board);
      if (novo) { UI.tipFixo = true; UI.mostrarTip(hab, novo); }
    });

    /* --- Fechar tooltip ao clicar / tocar fora --- */
    var eventoOutside = ('ontouchstart' in win) ? 'pointerdown' : 'click';

    doc.addEventListener(eventoOutside, function (ev) {
      var tip = UI.refs.tip;
      
      // Se o tooltip não estiver aberto, não faz nada
      if (!tip || !tip.classList.contains('is-open')) { return; }

      var clicouNoNode = ev.target.closest('.tt-node');
      var clicouNoTip  = ev.target.closest('#' + tip.id) || tip.contains(ev.target);

      // Se o clique NÃO foi dentro de um nó nem dentro do tooltip, esconde o tooltip
      if (!clicouNoNode && !clicouNoTip) {
        UI.esconderTip();
      }
    });

   if (UI.refs.tip) {
      /* "Ir para os desafios" agora é link real p/ /membros/desafios/?arvore=&hab=.
         Sem preventDefault: preserva navegação nativa (inclui abrir em nova aba); só fecha o tip. */
      UI.refs.tip.addEventListener('click', function (ev) {
        if (!ev.target.closest('.tt-tip__go')) { return; }
        UI.esconderTip();
      });
    }

    /* --- teclado: Backspace/Delete remove --- */
    UI.refs.board.addEventListener('keydown', function (ev) {
      if (ev.key !== 'Backspace' && ev.key !== 'Delete') { return; }
      var btn = ev.target.closest('.tt-node');
      if (!btn) { return; }
      ev.preventDefault();
      var hab = DADOS.indice[btn.getAttribute('data-hab')];
      if (hab) { Acoes.remover(hab); }
    });

    /* --- desafios --- */
    UI.refs.panel.addEventListener('click', function (ev) {
      var mx = ev.target.closest('[data-mx-estilo]');
      if (mx) {
        UI.alternarEstilo(mx.getAttribute('data-mx-desafio'), mx.getAttribute('data-mx-estilo'));
        return;
      }
      var b = ev.target.closest('[data-desafio]');
      if (!b) { return; }
      b.disabled = true;
      Acoes.enviarDesafio(b.getAttribute('data-desafio'));
    });

    /* --- títulos transversais: abrir os desafios da habilidade --- */
    doc.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-trans-hab]');
      if (!b) { return; }
      var hab = DADOS.indice[b.getAttribute('data-trans-hab')];
      if (!hab) { return; }
      UI.habSelecionada = hab.id;
      UI.perfilVisivel = hab.perfilId;
      UI.renderTabs();
      UI.aplicarVisibilidade();
      UI.renderPanel();
      UI.irParaDesafios();
    });

    /* --- barra de ações --- */
    if (UI.refs.btnSave) { UI.refs.btnSave.addEventListener('click', Acoes.salvar); }
    if (UI.refs.btnUndo) { UI.refs.btnUndo.addEventListener('click', Acoes.reverter); }
    if (UI.refs.btnWipe) { UI.refs.btnWipe.addEventListener('click', Acoes.zerar); }

    /* --- redimensionamento: redesenha conectores --- */
    var tRedraw;
    win.addEventListener('resize', function () {
      win.clearTimeout(tRedraw);
      tRedraw = win.setTimeout(UI.desenharConectores, 140);
    });

    /* --- aviso de saída com alterações pendentes --- */
    win.addEventListener('beforeunload', function (ev) {
      if (!Estado.sujo()) { return; }
      ev.preventDefault();
      ev.returnValue = '';
    });
  }


  /* ============================================================
     6) PORTARIA + BOOT
  ============================================================ */
  function temAcesso(tipos) {
    return tipos.some(function (t) { return DADOS.tiposComAcesso.indexOf(t) !== -1; });
  }

  function mostrarBloqueio() {
    var app  = $('#ttApp');
    var gate = $('#ttGate');
    if (app)  { app.hidden  = true; }
    if (gate) { gate.hidden = false; }
  }

  /* Estilos do seletor de linguagem — injetados aqui para não depender de
     outra versão de talentTree.css. Usam os mesmos tokens do painel. */
  function estilosMultiestilo() {
    if (doc.getElementById('tt-mx-css')) { return; }
    var st = doc.createElement('style');
    st.id = 'tt-mx-css';
    st.textContent =
      '.tt-mx{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:9px}' +
      '.tt-mx__rot{font-size:11px;font-weight:700;color:var(--udx-text-muted);margin-right:2px}' +
      '.tt-mx__btn{padding:5px 11px;border-radius:50px;border:1px solid var(--udx-border);background:rgba(2,2,26,.7);' +
        'color:var(--udx-text);font-family:var(--udx-font);font-size:11px;font-weight:700;cursor:pointer;min-height:30px;' +
        'transition:border-color 200ms ease,background-color 200ms ease}' +
      '.tt-mx__btn:hover{border-color:var(--panel-accent,var(--seg-accent))}' +
      '.tt-mx__btn[aria-pressed="true"]{background:var(--panel-grad,var(--seg-grad));border-color:transparent;color:#fff}' +
      '.tt-mx__btn:disabled{opacity:.38;cursor:not-allowed;text-decoration:line-through}' +
      '.tt-mx__btn:focus-visible{outline:2px solid var(--panel-accent,var(--seg-accent));outline-offset:2px}' +
      '.tt-mx__status{margin:8px 0 0;font-size:11.5px;color:var(--udx-text-muted)}' +
      '.tt-mx__status b{color:var(--udx-text)}' +
      '.tt-node--trans{border-radius:50%}' +
      '.tt-node--trans.is-locked{cursor:pointer}' +
      '.tt-node--trans.is-ranked,.tt-node--trans.is-maxed{background:var(--p-grad);color:#fff;border-color:transparent}' +
      '.tt-node--trans .tt-node__rank{min-width:24px}' +
      '.tt-legend__dot--trans{border-radius:50%;background:var(--seg-grad);border-color:transparent}' +
      '.tt-trans__painel{display:grid;gap:8px;margin:0 0 14px;padding:12px;border-radius:12px;' +
        'background:rgba(2,2,26,.55);border:1px solid var(--udx-border)}' +
      '.tt-trans{margin-top:34px}' +
      '.tt-trans__head h3{display:flex;align-items:center;gap:8px;margin:0 0 6px;font-size:1.05rem;color:var(--udx-text)}' +
      '.tt-trans__head p{margin:0 0 14px;font-size:12.5px;line-height:1.55;color:var(--udx-text-muted);max-width:720px}' +
      '.tt-trans__card{display:grid;gap:10px;align-content:start;align-items:stretch}' +
      '.tt-trans__card.is-locked{opacity:1}' +
      '.tt-trans__card.is-locked .tt-trans__topo{opacity:.8}' +
      '.tt-trans__card:not(.is-locked){border-color:var(--trans-cor)}' +
      '.tt-trans__card:not(.is-locked) .tt-title-card__icon{background:var(--trans-cor);box-shadow:none}' +
      '.tt-trans__topo{display:flex;align-items:center;gap:12px}' +
      '.tt-trans__topo small{font-weight:600;color:var(--udx-text-muted)}' +
      '.tt-trans__chip{flex-shrink:0;padding:3px 10px;border-radius:50px;font-size:10.5px;font-weight:700;' +
        'border:1px solid var(--udx-border);color:var(--udx-text-muted)}' +
      '.tt-trans__chip.is-ok{background:var(--trans-cor);border-color:transparent;color:#fff}' +
      '.tt-trans__desc{margin:0;font-size:12px;line-height:1.5;color:var(--udx-text-muted)}' +
      '.tt-trans__ling{display:flex;flex-wrap:wrap;gap:6px}' +
      '.tt-trans__l{padding:3px 9px;border-radius:50px;font-size:10.5px;font-weight:700;border:1px dashed var(--udx-border);color:var(--udx-text-muted)}' +
      '.tt-trans__l.is-ok{border-style:solid;border-color:var(--trans-cor);color:var(--udx-text)}' +
      '.tt-trans__l.is-pend{border-style:solid;color:var(--udx-text)}' +
      '.tt-trans__prox{margin:0;font-size:11.5px;color:var(--udx-text-muted)}' +
      '.tt-trans__prox b{color:var(--udx-text)}' +
      '.tt-trans__tiers{margin:0;padding:0;list-style:none;display:grid;gap:4px;font-size:11.5px;color:var(--udx-text-muted)}' +
      '.tt-trans__tiers b{display:inline-block;min-width:26px;color:var(--udx-text)}' +
      '.tt-trans__tiers li.is-ok{color:var(--udx-text)}' +
      '.tt-trans__ir{justify-self:start;display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border-radius:50px;' +
        'border:1px solid rgba(223,224,242,.28);background:rgba(255,255,255,.03);color:var(--udx-text);' +
        'font-family:var(--udx-font);font-size:11.5px;font-weight:700;cursor:pointer;min-height:34px}' +
      '.tt-trans__ir:hover{border-color:var(--trans-cor)}' +
      '.tt-trans__ir:focus-visible{outline:2px solid var(--trans-cor);outline-offset:2px}' +
      '.tt-trans__vazio{font-size:12.5px;color:var(--udx-text-muted)}' +
      '@media (min-width:768px){.tt-trans__lista{grid-template-columns:repeat(2,minmax(0,1fr))}}' +
      '@media (min-width:1200px){.tt-trans__lista{grid-template-columns:repeat(3,minmax(0,1fr))}}' +
      '@media (prefers-reduced-motion: reduce){.tt-mx__btn{transition:none}}';
    doc.head.appendChild(st);
  }

  /* Catálogo dos títulos transversais: carregado aqui para não exigir mudança no HTML. */
  function carregarCatalogoTitulos() {
    if (win.UDX_TITULOS || doc.getElementById('tt-titulos-js')) { return; }
    var s = doc.createElement('script');
    s.id = 'tt-titulos-js';
    s.src = '/js/titulos.data.js';
    s.onload = function () { if (Estado.dados) { UI.renderTransversais(); } };
    s.onerror = function () {
      UI.catalogoTitulosFalhou = true;
      if (Estado.dados) { UI.renderTransversais(); }
    };
    doc.head.appendChild(s);
  }

  function legendaTransversal() {
    var leg = doc.querySelector('.tt-legend');
    if (!leg || leg.querySelector('.tt-legend__dot--trans')) { return; }
    var item = el('span', 'tt-legend__item', '<span class="tt-legend__dot tt-legend__dot--trans"></span> Transversal (tier por notas)');
    leg.appendChild(item);
  }

  function boot() {
    estilosMultiestilo();
    legendaTransversal();
    carregarCatalogoTitulos();
    UI.montarEsqueleto();
    if (!UI.refs.board) { return; }

    fetch(API.me, { credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (u) {
        if (!u || !u.email) { win.location.href = '/entrar/'; return null; }

        var chip  = $('#userChip');
        var email = $('#userEmail');
        if (email) { email.textContent = u.email; }
        if (chip)  { chip.hidden = false; }

        var tipos = (Array.isArray(u.types) && u.types.length) ? u.types : [u.type || 'Free'];
        if (!temAcesso(tipos)) { mostrarBloqueio(); return null; }

        return Estado.carregar();
      })
      .catch(function () {
        /* Sem Worker (ambiente de desenvolvimento): segue em modo local. */
        return Estado.carregar();
      })
      .then(function (r) {
        if (r === null && !Estado.dados) { return; }
        if (!Estado.dados) { return; }
        var app = $('#ttApp');
        if (app) { app.hidden = false; }
        UI.renderTabs();
        UI.renderTudo();
        ligarEventos();
      });
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  /* Exposto para depuração e para o painel administrativo */
  win.UDX_TALENT_TREE = {
    estado: Estado,
    regras: Regras,
    ui:     UI,
    acoes:  Acoes
  };

}(window, document));