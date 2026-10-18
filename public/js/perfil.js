/* ================================================================
   MEU PERFIL — Up Dance Experience
   /js/perfil.js  ·  página /membros/perfil/
   ----------------------------------------------------------------
   Lê GET /api/perfil/resumo (uma chamada) e monta o painel:
   ritmo diário, desafios, habilidades, eventos da plataforma
   (presenciais e on-line), experiência, ranking, títulos e
   reputação.
   Usa, só para exibir nomes, os módulos já existentes:
     /js/talentTree.data.js  → window.UDX_TALENTOS (títulos da Árvore)
     /js/reputacao.data.js   → window.UDX_REP (bandas e títulos)
   Preferências de visualização (aba, período, meta do dia, ordem)
   ficam no navegador (localStorage), só por conveniência.
================================================================ */
(function (win, doc) {
  'use strict';

  var API = '/api/perfil/resumo';
  var CHAVE_PREFS = 'udx:perfil:v1';

  /* Rótulos e destinos — iguais aos de desafios.js (ROTAS) e às páginas de trilha. */
  var TRILHAS = {
    fundamentos:   { rotulo: 'Nível Free',          pagina: '/membros/nivel-free/arvore-de-habilidades/' },
    iniciante:     { rotulo: 'Nível Iniciante',     pagina: '/membros/nivel-iniciante/arvore-de-habilidades/' },
    intermediario: { rotulo: 'Nível Intermediário', pagina: '/membros/nivel-intermediario/arvore-de-habilidades/' },
    tecnico:       { rotulo: 'Nível Técnico',       pagina: '/membros/nivel-tecnico/arvore-de-habilidades/' }
  };
  var PAGINA_TALENTOS = '/membros/nivel-estagiario/arvore-de-talentos/';

  /* Etapas da jornada: Fundamentos (Nível Free) → Formação (Iniciante,
     Intermediário, Técnico) → Profissionalização (Árvores de Talentos).
     A etapa sai do id da trilha; nada muda no banco. */
  var FORMACAO = ['iniciante', 'intermediario', 'tecnico'];
  function etapaDe(origem, grupo) {
    if (origem === 'talentos') return 'talentos';
    return FORMACAO.indexOf(grupo) !== -1 ? 'formacao' : 'fundamentos';
  }

  /* Nomes das insígnias de trilha (dos módulos de dados; ini/int seguem o padrão). */
  var INSIGNIAS = {
    'fund-insignia': { nome: 'Fundamentos Concluídos',          icone: 'mdi-medal-outline' },
    'ini-insignia':  { nome: 'Insígnia do Nível Iniciante',     icone: 'mdi-medal-outline' },
    'int-insignia':  { nome: 'Insígnia do Nível Intermediário', icone: 'mdi-medal-outline' },
    'tec-insignia':  { nome: 'Insígnia do Nível Técnico',       icone: 'mdi-medal' }
  };

  /* Tipos de desafio — mesmos rótulos/ícones dos módulos de dados. */
  var TIPOS = {
    tarefa:    { label: 'Tarefa',    icone: 'mdi-checkbox-marked-circle-outline' },
    atividade: { label: 'Atividade', icone: 'mdi-account-clock-outline' },
    desafio:   { label: 'Desafio',   icone: 'mdi-hand-coin-outline' },
    evento:    { label: 'Evento',    icone: 'mdi-calendar-star' }
  };

  /* Ordem base → topo dos tipos de membro (MEMBER_TYPES do worker). */
  var ORDEM_TIPOS = ['Free', 'Iniciante', 'Intermediário', 'Técnico', 'Estagiário(a)',
                     'Monitor(a)', 'Assistente', 'Professor(a)', 'Premium'];

  /* ---------------- utilitários ---------------- */
  function $(s, r) { return (r || doc).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function fmt(n) { return String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function plural(n, um, varios) { return fmt(n) + ' ' + (n === 1 ? um : varios); }

  /* Datas do D1 vêm em UTC ("AAAA-MM-DD HH:MM:SS" ou ISO). Exibimos no fuso do navegador. */
  function data(s) {
    if (!s) return null;
    var t = String(s);
    var d = /[zZ]$|[+-]\d\d:?\d\d$/.test(t) ? new Date(t) : new Date(t.replace(' ', 'T') + 'Z');
    return isNaN(d.getTime()) ? null : d;
  }
  function chaveDia(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function somaDias(d, n) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + n); return x; }
  var fDia  = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' });
  var fMes  = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });
  var fHora = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });
  var fSem  = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' });
  function diaCurto(d) { return fDia.format(d).replace('.', ''); }
  function quando(d) {
    if (!d) return '';
    var hoje = chaveDia(new Date()), ontem = chaveDia(somaDias(new Date(), -1)), k = chaveDia(d);
    if (k === hoje) return 'hoje, ' + fHora.format(d);
    if (k === ontem) return 'ontem, ' + fHora.format(d);
    var dias = Math.round((somaDias(new Date(), 0) - somaDias(d, 0)) / 864e5);
    if (dias > 1 && dias < 7) return 'há ' + dias + ' dias';
    return diaCurto(d) + (d.getFullYear() !== new Date().getFullYear() ? ' de ' + d.getFullYear() : '');
  }

  function iniciais(nome, email) {
    var p = String(nome || '').trim().split(/\s+/).filter(Boolean);
    if (p.length) return (p[0][0] + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase();
    return String(email || '?')[0].toUpperCase();
  }
  function rotuloGrupo(origem, grupo, nomes) {
    if (origem === 'talentos') {
      return 'Profissionalização, ' + ((nomes.perfisTalento && nomes.perfisTalento[grupo]) || grupo);
    }
    return (TRILHAS[grupo] && TRILHAS[grupo].rotulo) || (nomes.niveis && nomes.niveis[grupo]) || grupo;
  }
  function linkDesafio(item) {
    var arvore = item.origem === 'talentos' ? 'talentos' : item.grupo;
    return '/membros/desafios/?arvore=' + encodeURIComponent(arvore) +
      (item.hab ? '&hab=' + encodeURIComponent(item.hab) : '');
  }
  function unidadeXp(origem) { return origem === 'talentos' ? 'XP' : 'XPE'; }

  /* ---------------- preferências (só neste navegador) ---------------- */
  var prefs = { aba: 'pendente', dias: 14, meta: 3, habOrdem: 'progresso', escopo: 'geral', evModo: '', nivel: '', form: '', prof: '', ins: '' };
  try { var salvo = JSON.parse(win.localStorage.getItem(CHAVE_PREFS) || 'null'); if (salvo) for (var k in salvo) prefs[k] = salvo[k]; } catch (e) {}
  /* Antes da divisão Fundamentos/Formação, o nível aberto da Formação ficava em "nivel". */
  if (/^trilha\|/.test(prefs.nivel || '') && etapaDe('trilha', prefs.nivel.split('|')[1]) === 'formacao') { prefs.form = prefs.form || prefs.nivel; prefs.nivel = ''; }
  function salvarPrefs() { try { win.localStorage.setItem(CHAVE_PREFS, JSON.stringify(prefs)); } catch (e) {} }

  var estado = { dados: null, busca: '', origem: '', mostrar: 8, habTodas: false, evTodos: false, nv: { status: '', parte: '', mostrar: 6 }, fv: { status: '', parte: '', mostrar: 6 }, pv: { status: '', parte: '', mostrar: 6 } };

  /* ================================================================
     DERIVAÇÕES — tudo calculado a partir da resposta da API
  ================================================================ */
  function derivar(d) {
    var lista = (d.desafios || []).map(function (x) {
      return {
        origem: x.origem, id: x.id, grupo: x.grupo, xp: Number(x.xp) || 0, status: x.status,
        parecer: x.parecer || '', nome: x.nome || x.id, tipo: x.tipo || 'tarefa',
        hab: x.hab || '', habNome: x.hab_nome || '', card: x.card || '',
        enviado: data(x.enviado), avaliado: data(x.avaliado)
      };
    });
    var porStatus = { pendente: 0, aprovado: 0, recusado: 0 };
    var xpTrilha = {}, xpTalento = {}, total = 0;
    var envDia = {}, aprDia = {};
    lista.forEach(function (x) {
      porStatus[x.status] = (porStatus[x.status] || 0) + 1;
      if (x.enviado) { var ke = chaveDia(x.enviado); envDia[ke] = (envDia[ke] || 0) + 1; }
      if (x.status === 'aprovado') {
        total += x.xp;
        if (x.origem === 'talentos') xpTalento[x.grupo] = (xpTalento[x.grupo] || 0) + x.xp;
        else xpTrilha[x.grupo] = (xpTrilha[x.grupo] || 0) + x.xp;
        var ka = chaveDia(x.avaliado || x.enviado); aprDia[ka] = (aprDia[ka] || 0) + 1;
      }
    });

    /* Sequência: dias seguidos com pelo menos um envio. Se hoje ainda não
       houve envio, a sequência de ontem continua valendo até o fim do dia. */
    var hoje = new Date(), atual = 0, i = envDia[chaveDia(hoje)] ? 0 : 1;
    while (envDia[chaveDia(somaDias(hoje, -i))]) { atual++; i++; }
    var dias = Object.keys(envDia).sort(), recorde = 0, corrida = 0, ant = null;
    dias.forEach(function (k) {
      var dd = new Date(k + 'T12:00:00');
      corrida = (ant && Math.round((dd - ant) / 864e5) === 1) ? corrida + 1 : 1;
      recorde = Math.max(recorde, corrida); ant = dd;
    });

    /* Trilha mais recente com envio — usada no anel do avatar. */
    var recente = null;
    lista.forEach(function (x) { if (x.origem === 'trilha' && (!recente || x.enviado > recente.enviado)) recente = x; });

    return {
      lista: lista, porStatus: porStatus, xpTrilha: xpTrilha, xpTalento: xpTalento, xpTotal: total,
      envDia: envDia, aprDia: aprDia, sequencia: atual, recorde: recorde,
      hojeEnviados: envDia[chaveDia(hoje)] || 0, hojeAprovados: aprDia[chaveDia(hoje)] || 0,
      trilhaRecente: recente ? recente.grupo : null
    };
  }

  /* ================================================================
     HERO
  ================================================================ */
  function renderHero(d, v) {
    var m = d.membro || {};
    var nome = m.nome || String(m.email || '').split('@')[0];
    var tipos = (m.tipos || []).slice().sort(function (a, b) { return ORDEM_TIPOS.indexOf(a) - ORDEM_TIPOS.indexOf(b); });
    var topo = tipos[tipos.length - 1];
    var desde = data(m.desde);

    var anelPct = 0, anelTxt = 'Sem trilha em andamento';
    var cfg = d.config && d.config.trilhas || {};
    if (v.trilhaRecente && cfg[v.trilhaRecente]) {
      var lim = cfg[v.trilhaRecente].limiar || 1;
      anelPct = Math.min(100, Math.round(((v.xpTrilha[v.trilhaRecente] || 0) / lim) * 100));
      anelTxt = ((TRILHAS[v.trilhaRecente] && TRILHAS[v.trilhaRecente].rotulo) || v.trilhaRecente) + ': ' + anelPct + '% do XPE do nível';
    }

    var g = d.ranking && d.ranking.geral;
    var pos = g && g.pos ? g.pos + 'º' : '—';
    var posTxt = g && g.pos ? 'no ranking geral, de ' + fmt(g.participantes) : 'no ranking geral';

    $('#pfHero').innerHTML =
      '<div class="pf-id">' +
        '<div class="pf-avatar" style="--pct:' + anelPct + '" role="img" aria-label="' + esc(anelTxt) + '" title="' + esc(anelTxt) + '">' +
          '<span>' + esc(iniciais(m.nome, m.email)) + '</span></div>' +
        '<div style="min-width:0">' +
          '<h1 class="pf-nome">' + esc(nome) + '</h1>' +
          '<p class="pf-meta">' + (desde ? 'Na Up Dance desde ' + esc(fMes.format(desde)) : esc(m.email || '')) + '</p>' +
          '<div class="pf-tipos">' + tipos.map(function (t) {
            return '<span class="pf-tipo' + (t === topo ? ' pf-tipo--topo' : '') + '">' + esc(t) + '</span>';
          }).join('') + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="pf-numeros">' +
        num('mdi-lightning-bolt', fmt(v.xpTotal), 'de experiência no total') +
        num('mdi-flag-checkered', fmt(v.porStatus.aprovado || 0), (v.porStatus.aprovado === 1 ? 'desafio aprovado' : 'desafios aprovados')) +
        num('mdi-podium', pos, posTxt) +
        num('mdi-fire', fmt(v.sequencia), v.sequencia === 1 ? 'dia seguido enviando' : 'dias seguidos enviando') +
      '</div>';

    function num(ic, valor, rotulo) {
      return '<div class="pf-num"><b><span class="mdi ' + ic + '" aria-hidden="true"></span>' + valor + '</b><span>' + esc(rotulo) + '</span></div>';
    }
  }

  /* ================================================================
     SEU RITMO — meta do dia + gráfico espelhado (enviados ↑ / aprovados ↓)
  ================================================================ */
  function renderHoje(v) {
    var meta = Math.max(1, Math.min(10, Number(prefs.meta) || 3));
    var feito = v.hojeEnviados, frac = Math.min(1, feito / meta);
    var R = 44, C = 2 * Math.PI * R;
    $('#pfHoje').innerHTML =
      '<div class="pf-meta-anel">' +
        '<svg viewBox="0 0 104 104" aria-hidden="true">' +
          '<circle cx="52" cy="52" r="' + R + '" fill="none" stroke="rgba(223,224,242,.10)" stroke-width="8"/>' +
          (frac > 0 ? '<circle cx="52" cy="52" r="' + R + '" fill="none" stroke="var(--pf-alcancado)" stroke-width="8" stroke-linecap="round" ' +
            'stroke-dasharray="' + (C * frac).toFixed(1) + ' ' + C.toFixed(1) + '"/>' : '') +
        '</svg>' +
        '<div class="pf-meta-anel__txt"><b>' + feito + '/' + meta + '</b><span>meta de hoje</span></div>' +
      '</div>' +
      '<div class="pf-hoje__lista">' +
        '<div><span class="mdi mdi-upload-outline" aria-hidden="true"></span><b>' + plural(feito, 'envio', 'envios') + '</b> hoje' +
          (feito >= meta ? ', meta cumprida' : ', faltam ' + (meta - feito)) + '</div>' +
        '<div><span class="mdi mdi-check-decagram-outline" aria-hidden="true"></span><b>' + plural(v.hojeAprovados, 'aprovação', 'aprovações') + '</b> hoje</div>' +
        '<div><span class="mdi mdi-timer-sand" aria-hidden="true"></span><b>' + fmt(v.porStatus.pendente || 0) + '</b> aguardando validação</div>' +
        '<div><span class="mdi mdi-fire" aria-hidden="true"></span>Recorde: <b>' + plural(v.recorde, 'dia', 'dias') + '</b> seguidos</div>' +
        '<div class="pf-passo" role="group" aria-label="Ajustar meta do dia">' +
          '<button type="button" data-meta="-1" aria-label="Diminuir meta">−</button>' +
          '<span>Meta: ' + plural(meta, 'envio', 'envios') + ' por dia</span>' +
          '<button type="button" data-meta="1" aria-label="Aumentar meta">+</button>' +
        '</div>' +
      '</div>';
  }

  function renderGrafico(v) {
    var caixa = $('#pfGrafico');
    var dias = Number(prefs.dias) || 14;
    var hoje = new Date();
    var serie = [];
    for (var i = dias - 1; i >= 0; i--) {
      var dd = somaDias(hoje, -i), k = chaveDia(dd);
      serie.push({ d: dd, k: k, env: v.envDia[k] || 0, apr: v.aprDia[k] || 0, hoje: i === 0 });
    }
    var max = 1; serie.forEach(function (s) { max = Math.max(max, s.env, s.apr); });
    var teto = max <= 4 ? max : Math.ceil(max / 2) * 2;

    var W = Math.max(280, caixa.clientWidth || 600), H = caixa.clientWidth >= 520 ? 210 : 190;
    var esq = 26, dir = 6, topo = 8, rodape = 22;
    var meio = topo + (H - topo - rodape) / 2, alt = (H - topo - rodape) / 2 - 3;
    var slot = (W - esq - dir) / dias;
    var larg = Math.max(3, Math.min(18, slot * 0.56));
    var curto = slot < 40;                                   // "30/9" em vez de "30 de set"
    var passoRot = Math.max(1, Math.ceil((curto ? 30 : 52) / slot));
    function rotDia(d) { return curto ? d.getDate() + '/' + (d.getMonth() + 1) : diaCurto(d); }

    function barra(x, h, cima) {
      if (h <= 0) return '';
      var r = Math.min(4, larg / 2, h), y0 = cima ? meio - 2 : meio + 2;
      var y1 = cima ? y0 - h : y0 + h, x1 = x + larg;
      return cima
        ? '<path d="M' + x + ',' + y0 + 'V' + (y1 + r) + 'Q' + x + ',' + y1 + ' ' + (x + r) + ',' + y1 + 'H' + (x1 - r) + 'Q' + x1 + ',' + y1 + ' ' + x1 + ',' + (y1 + r) + 'V' + y0 + 'Z" fill="var(--pf-enviado)"/>'
        : '<path d="M' + x + ',' + y0 + 'V' + (y1 - r) + 'Q' + x + ',' + y1 + ' ' + (x + r) + ',' + y1 + 'H' + (x1 - r) + 'Q' + x1 + ',' + y1 + ' ' + x1 + ',' + (y1 - r) + 'V' + y0 + 'Z" fill="var(--pf-alcancado)"/>';
    }

    var svg = '<svg class="pf-svg-ritmo" viewBox="0 0 ' + W + ' ' + H + '" style="height:' + H + 'px" role="group" aria-label="Envios e aprovações por dia nos últimos ' + dias + ' dias">' +
      '<line class="grade" x1="' + esq + '" x2="' + (W - dir) + '" y1="' + (meio - alt) + '" y2="' + (meio - alt) + '"/>' +
      '<line class="grade" x1="' + esq + '" x2="' + (W - dir) + '" y1="' + (meio + alt) + '" y2="' + (meio + alt) + '"/>' +
      '<line class="eixo" x1="' + esq + '" x2="' + (W - dir) + '" y1="' + meio + '" y2="' + meio + '"/>' +
      '<text x="' + (esq - 6) + '" y="' + (meio - alt + 4) + '" text-anchor="end">' + teto + '</text>' +
      '<text x="' + (esq - 6) + '" y="' + (meio + 4) + '" text-anchor="end">0</text>' +
      '<text x="' + (esq - 6) + '" y="' + (meio + alt + 4) + '" text-anchor="end">' + teto + '</text>';

    serie.forEach(function (s, idx) {
      var cx = esq + slot * idx + slot / 2, x = cx - larg / 2;
      var he = (s.env / teto) * alt, ha = (s.apr / teto) * alt;
      var rot = (idx % passoRot === (dias - 1) % passoRot) || s.hoje;
      var desc = (s.hoje ? 'Hoje, ' : '') + diaCurto(s.d) + ': ' + plural(s.env, 'enviado', 'enviados') + ', ' + plural(s.apr, 'aprovado', 'aprovados');
      svg += '<g class="dia' + (s.hoje ? ' is-hoje' : '') + '" data-i="' + idx + '">' +
        '<rect class="foco" x="' + (cx - slot / 2) + '" y="' + topo + '" width="' + slot + '" height="' + (H - topo - rodape) + '" fill="transparent" rx="6"/>' +
        barra(x, he, true) + barra(x, ha, false) +
        (rot ? '<text class="rotulo" x="' + cx + '" y="' + (H - 6) + '" text-anchor="middle">' + esc(s.hoje ? 'hoje' : rotDia(s.d)) + '</text>' : '') +
        '<rect class="alvo" x="' + (cx - slot / 2) + '" y="' + topo + '" width="' + slot + '" height="' + (H - topo - rodape) + '" tabindex="0" role="img" aria-label="' + esc(desc) + '"/>' +
        '</g>';
    });
    svg += '</svg>';
    caixa.innerHTML = svg;

    var tip = $('#pfTip');
    function mostrar(g, ev) {
      var s = serie[Number(g.getAttribute('data-i'))];
      tip.innerHTML = '<b>' + esc((s.hoje ? 'Hoje, ' : fSem.format(s.d).replace('.', '') + ', ') + diaCurto(s.d)) + '</b><br>' +
        '<i style="background:var(--pf-enviado)"></i>' + plural(s.env, 'enviado', 'enviados') + '<br>' +
        '<i style="background:var(--pf-alcancado)"></i>' + plural(s.apr, 'aprovado', 'aprovados');
      var r = g.getBoundingClientRect();
      var x = ev && ev.clientX ? ev.clientX : r.left + r.width / 2;
      tip.style.left = Math.min(win.innerWidth - 200, Math.max(8, x + 12)) + 'px';
      tip.style.top = Math.max(8, r.top + 10) + 'px';
      tip.classList.add('is-open'); tip.setAttribute('aria-hidden', 'false');
    }
    function esconder() { tip.classList.remove('is-open'); tip.setAttribute('aria-hidden', 'true'); }
    $$('.dia', caixa).forEach(function (g) {
      g.addEventListener('mousemove', function (e) { mostrar(g, e); });
      g.addEventListener('mouseleave', esconder);
      var alvo = $('.alvo', g);
      alvo.addEventListener('focus', function () { mostrar(g); });
      alvo.addEventListener('blur', esconder);
    });

    var tEnv = 0, tApr = 0, pico = null;
    serie.forEach(function (s) { tEnv += s.env; tApr += s.apr; if (s.env && (!pico || s.env > pico.env)) pico = s; });
    $('#pfGraficoResumo').textContent = tEnv || tApr
      ? 'Nos últimos ' + dias + ' dias: ' + plural(tEnv, 'envio', 'envios') + ' e ' + plural(tApr, 'aprovação', 'aprovações') + '.' +
        (pico ? ' Dia mais ativo: ' + diaCurto(pico.d) + ' (' + plural(pico.env, 'envio', 'envios') + ').' : '')
      : 'Nenhum envio nos últimos ' + dias + ' dias. Cada desafio enviado aparece aqui no dia do envio.';

    $$('#pfPeriodo button').forEach(function (b) { b.setAttribute('aria-pressed', String(Number(b.getAttribute('data-dias')) === dias)); });
  }

  /* ================================================================
     DESAFIOS — aguardando, aprovados, recusados
  ================================================================ */
  function renderDesafios(d, v) {
    var aba = prefs.aba;
    $$('#pfAbas [data-cont]').forEach(function (s) { s.textContent = fmt(v.porStatus[s.getAttribute('data-cont')] || 0); });
    $$('#pfAbas button').forEach(function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-status') === aba)); });

    var q = estado.busca.trim().toLowerCase();
    var itens = v.lista.filter(function (x) {
      if (x.status !== aba) return false;
      if (estado.origem && etapaDe(x.origem, x.grupo) !== estado.origem) return false;
      if (q && (x.nome + ' ' + x.habNome + ' ' + rotuloGrupo(x.origem, x.grupo, d.nomes || {})).toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
    itens.sort(function (a, b) {
      var da = aba === 'pendente' ? a.enviado : (a.avaliado || a.enviado);
      var db = aba === 'pendente' ? b.enviado : (b.avaliado || b.enviado);
      return (db || 0) - (da || 0);
    });

    var caixa = $('#pfDesafios');
    if (!itens.length) {
      var vazio = q || estado.origem ? 'Nenhum desafio encontrado com esse filtro.'
        : aba === 'pendente' ? 'Nada aguardando validação. Envie um desafio na sua trilha e ele aparece aqui até a coordenação avaliar. <a href="/membros/desafios/">Abrir a central de desafios</a>'
        : aba === 'aprovado' ? 'Nenhum desafio aprovado ainda. Os aprovados somam experiência e contam para o ranking.'
        : 'Nenhum desafio recusado.';
      caixa.innerHTML = '<div class="pf-vazio">' + vazio + '</div>';
      return;
    }
    var visiveis = itens.slice(0, estado.mostrar);
    caixa.innerHTML = '<ul class="pf-lista">' + visiveis.map(function (x) {
      var tp = TIPOS[x.tipo] || TIPOS.tarefa;
      var ctx = rotuloGrupo(x.origem, x.grupo, d.nomes || {}) + (x.habNome ? ', ' + x.habNome : '');
      var qd = x.status === 'pendente' ? 'Enviado ' + quando(x.enviado)
             : x.status === 'aprovado' ? 'Aprovado ' + quando(x.avaliado || x.enviado)
             : 'Recusado ' + quando(x.avaliado || x.enviado);
      return '<li class="pf-item" data-status="' + esc(x.status) + '">' +
        '<span class="pf-item__ico" title="' + esc(tp.label) + '"><span class="mdi ' + tp.icone + '" aria-hidden="true"></span></span>' +
        '<div style="min-width:0">' +
          '<span class="pf-item__nome">' + esc(x.nome) + '</span>' +
          '<span class="pf-item__ctx">' + esc(ctx) + '</span>' +
          '<span class="pf-item__ctx">' + esc(tp.label) + '. ' + esc(qd) + '</span>' +
          (x.parecer ? '<span class="pf-item__parecer">' + esc(x.parecer) + '</span>' : '') +
        '</div>' +
        '<div class="pf-item__dir">' +
          '<span class="pf-xp">+' + fmt(x.xp) + ' ' + unidadeXp(x.origem) + '</span>' +
          '<a class="pf-abrir" href="' + esc(linkDesafio(x)) + '">Abrir</a>' +
        '</div>' +
      '</li>';
    }).join('') + '</ul>' +
    (itens.length > visiveis.length
      ? '<button type="button" class="pf-mais" id="pfMais">Mostrar mais ' + Math.min(8, itens.length - visiveis.length) + ' de ' + (itens.length - visiveis.length) + ' restantes</button>'
      : '');
  }

  /* ================================================================
     HABILIDADES
  ================================================================ */
  function renderHabilidades(d, v) {
    var conta = {};
    v.lista.forEach(function (x) {
      if (!x.hab) return;
      var k = x.origem + '|' + x.hab, c = conta[k] || (conta[k] = { ok: 0, pend: 0, xp: 0 });
      if (x.status === 'aprovado') { c.ok++; c.xp += x.xp; } else if (x.status === 'pendente') c.pend++;
    });
    var habs = (d.habilidades || []).map(function (h) {
      var c = conta[h.origem + '|' + h.id] || { ok: 0, pend: 0, xp: 0 };
      var total = Math.max(1, Number(h.total) || 1);
      return { origem: h.origem, id: h.id, nome: h.nome || h.id, grupo: h.grupo, total: total,
               ok: c.ok, pend: c.pend, xp: c.xp, pct: c.ok / total };
    });
    var ordem = prefs.habOrdem;
    habs.sort(function (a, b) {
      if (ordem === 'nome') return a.nome.localeCompare(b.nome, 'pt-BR');
      if (ordem === 'xp') return b.xp - a.xp || b.pct - a.pct;
      return b.pct - a.pct || b.ok - a.ok;
    });
    $('#pfHabOrdem').value = ordem;
    var caixa = $('#pfHabilidades');
    if (!habs.length) {
      caixa.innerHTML = '<div class="pf-vazio">Suas habilidades aparecem aqui assim que você enviar o primeiro desafio de uma trilha ou da Árvore de Talentos.</div>';
      return;
    }
    var lim = estado.habTodas ? habs.length : 6;
    caixa.innerHTML = '<div class="pf-linhas">' + habs.slice(0, lim).map(function (h) {
      var okP = (h.ok / h.total) * 100, pdP = (h.pend / h.total) * 100;
      var completo = h.ok >= h.total;
      return '<div class="pf-linha">' +
        '<div class="pf-linha__topo">' +
          '<a href="' + esc(linkDesafio({ origem: h.origem, grupo: h.grupo, hab: h.id })) + '">' + esc(h.nome) + '</a>' +
          '<span class="pf-linha__valor">' + h.ok + ' de ' + h.total + (completo ? ' <span class="pf-selo"><span class="mdi mdi-check" aria-hidden="true"></span>completa</span>' : '') + '</span>' +
        '</div>' +
        '<div class="pf-trilho" role="img" aria-label="' + esc(h.ok + ' aprovados e ' + h.pend + ' aguardando, de ' + h.total + ' desafios') + '">' +
          (okP ? '<i class="ok" style="width:' + okP.toFixed(1) + '%"></i>' : '') +
          (pdP ? '<i class="pend" style="width:' + pdP.toFixed(1) + '%"></i>' : '') +
        '</div>' +
        '<div class="pf-linha__nota">' + esc(rotuloGrupo(h.origem, h.grupo, d.nomes || {})) +
          (h.pend ? ', ' + plural(h.pend, 'aguardando validação', 'aguardando validação') : '') +
          (h.xp ? ', ' + fmt(h.xp) + ' ' + unidadeXp(h.origem) : '') + '</div>' +
      '</div>';
    }).join('') + '</div>' +
    (habs.length > 6 ? '<button type="button" class="pf-mais" id="pfHabTodas">' + (estado.habTodas ? 'Mostrar só as 6 primeiras' : 'Mostrar todas as ' + habs.length + ' habilidades') + '</button>' : '') +
    '<div class="pf-legenda" style="margin-top:12px" aria-hidden="true"><span><i style="background:var(--pf-alcancado)"></i>Aprovados</span><span><i style="background:var(--pf-pendente)"></i>Aguardando validação</span></div>';
  }

  /* ================================================================
     EVENTOS — encontros presenciais e on-line promovidos pela plataforma
     (tabelas eventos + evento_participacoes).
  ================================================================ */
  /* Eventos são marcados no horário de Brasília: exibimos sempre nele, com a
     indicação "(Brasília)" para quem estiver com o aparelho em outro fuso. */
  var TZ_EV = 'America/Sao_Paulo';
  var fEvDiaNum = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', timeZone: TZ_EV });
  var fEvMes    = new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: TZ_EV });
  var fEvAno    = new Intl.DateTimeFormat('pt-BR', { year: 'numeric', timeZone: TZ_EV });
  var fEvHora   = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: TZ_EV });
  var foraDeBrasilia = (function () { try { return Intl.DateTimeFormat().resolvedOptions().timeZone !== TZ_EV; } catch (e) { return false; } })();
  function evMes(d) { return fEvMes.format(d).replace('.', ''); }
  var TIPOS_EVENTO = {
    workshop: 'Workshop', 'aula-aberta': 'Aula aberta', battle: 'Battle', mostra: 'Mostra',
    apresentacao: 'Apresentação', live: 'Live', encontro: 'Encontro'
  };
  function renderEventos(d) {
    var modo = prefs.evModo || '';
    $$('#pfEvModo button').forEach(function (b) { b.setAttribute('aria-pressed', String((b.getAttribute('data-modo') || '') === modo)); });
    var agora = new Date();
    var todos = (d.eventos || []).map(function (e) {
      return { titulo: e.titulo, modalidade: e.modalidade === 'online' ? 'online' : 'presencial', tipo: e.tipo,
               inicio: data(e.inicio), fim: data(e.fim), local: e.local, link: e.link,
               situacao: e.situacao, papel: e.papel, resultado: e.resultado };
    }).filter(function (e) { return e.inicio; });
    var caixa = $('#pfEventos');
    if (!todos.length) {
      caixa.innerHTML = '<div class="pf-vazio">Você ainda não participou de eventos da Up Dance. Quando se inscrever em um encontro presencial ou on-line, ele aparece aqui.</div>';
      return;
    }
    var lista = todos.filter(function (e) { return !modo || e.modalidade === modo; });
    var proximos = lista.filter(function (e) { return (e.fim || e.inicio) >= agora && e.situacao === 'inscrito'; })
                        .sort(function (a, b) { return a.inicio - b.inicio; });
    var passados = lista.filter(function (e) { return proximos.indexOf(e) === -1; })
                        .sort(function (a, b) { return b.inicio - a.inicio; });

    var pres = todos.filter(function (e) { return e.situacao === 'presente'; });
    var presP = pres.filter(function (e) { return e.modalidade === 'presencial'; }).length;
    var resumo = '<p class="pf-rank__dica"><b>' + plural(pres.length, 'presença', 'presenças') + '</b>' +
      (pres.length ? ': ' + plural(presP, 'presencial', 'presenciais') + ' e ' + fmt(pres.length - presP) + ' on-line' : '') +
      (proximos.length ? '. ' + plural(proximos.length, 'inscrição em evento próximo', 'inscrições em eventos próximos') + '.' : '.') + '</p>';

    if (!lista.length) {
      caixa.innerHTML = resumo + '<div class="pf-vazio">Nenhum evento ' + (modo === 'online' ? 'on-line' : 'presencial') + ' por aqui ainda.</div>';
      return;
    }
    var limite = estado.evTodos ? passados.length : 6;
    caixa.innerHTML = resumo +
      (proximos.length ? '<h3 class="pf-ev-grupo">Próximos</h3><ul class="pf-lista">' + proximos.map(function (e) { return cartao(e, true); }).join('') + '</ul>' : '') +
      (passados.length ? '<h3 class="pf-ev-grupo">Participações</h3><ul class="pf-lista">' + passados.slice(0, limite).map(function (e) { return cartao(e, false); }).join('') + '</ul>' : '') +
      (passados.length > 6 ? '<button type="button" class="pf-mais" id="pfEvTodos">' + (estado.evTodos ? 'Mostrar só os 6 mais recentes' : 'Mostrar todas as ' + passados.length + ' participações') + '</button>' : '');

    function cartao(e, futuro) {
      var hora = fEvHora.format(e.inicio) + (e.fim ? '–' + fEvHora.format(e.fim) : '') + (foraDeBrasilia ? ' (Brasília)' : '');
      var ano = fEvAno.format(e.inicio);
      var onde = e.modalidade === 'online'
        ? '<span><span class="mdi mdi-video-outline" aria-hidden="true"></span>On-line</span>'
        : '<span><span class="mdi mdi-map-marker-outline" aria-hidden="true"></span>' + esc(e.local || 'Presencial') + '</span>';
      var estadoTxt = futuro ? ['inscrito', 'mdi-ticket-confirmation-outline', 'Inscrito(a)']
        : e.situacao === 'presente' ? ['presente', 'mdi-check-circle-outline', 'Presente']
        : e.situacao === 'ausente' ? ['ausente', 'mdi-close-circle-outline', 'Ausente']
        : ['inscrito', 'mdi-timer-sand', 'Presença a confirmar'];
      var sala = futuro && e.modalidade === 'online' && /^https:\/\//i.test(e.link || '')
        ? '<a class="pf-sala" href="' + esc(e.link) + '" target="_blank" rel="noopener noreferrer">Entrar na sala</a>' : '';
      return '<li class="pf-evento' + (futuro ? ' is-proximo' : '') + '">' +
        '<div class="pf-data" aria-hidden="true"><b>' + fEvDiaNum.format(e.inicio) + '</b><span>' + esc(evMes(e.inicio)) + '</span></div>' +
        '<div style="min-width:0">' +
          '<span class="pf-evento__titulo">' + esc(e.titulo) + '</span>' +
          '<div class="pf-evento__info">' +
            '<span><span class="mdi mdi-calendar-outline" aria-hidden="true"></span>' + esc(fEvDiaNum.format(e.inicio) + ' de ' + evMes(e.inicio) + (ano !== fEvAno.format(agora) ? ' de ' + ano : '') + ', ' + hora) + '</span>' +
            onde +
            (TIPOS_EVENTO[e.tipo] ? '<span><span class="mdi mdi-tag-outline" aria-hidden="true"></span>' + esc(TIPOS_EVENTO[e.tipo]) + '</span>' : '') +
          '</div>' +
          '<div class="pf-evento__selos">' +
            '<span class="pf-estado" data-s="' + estadoTxt[0] + '"><span class="mdi ' + estadoTxt[1] + '" aria-hidden="true"></span>' + estadoTxt[2] + '</span>' +
            (e.papel && e.papel !== 'participante' ? '<span class="pf-estado">' + esc(e.papel.charAt(0).toUpperCase() + e.papel.slice(1)) + '</span>' : '') +
            (e.resultado ? '<span class="pf-estado" data-s="resultado"><span class="mdi mdi-trophy-outline" aria-hidden="true"></span>' + esc(e.resultado) + '</span>' : '') +
            sala +
          '</div>' +
        '</div>' +
      '</li>';
    }
  }

  /* ================================================================
     SEUS NÍVEIS — cada trilha de nível e cada perfil da Árvore de
     Talentos vira um painel que abre: progresso por card (ou por
     habilidade), situação dos desafios do nível, posição no ranking
     do nível e atalhos. Clicar num card filtra os desafios dele.
  ================================================================ */
  /* Cores de cada carreira — as mesmas da página da Árvore de Talentos (talentTree.js). */
  var COR_PERFIL = {
    bailarino: 'linear-gradient(135deg, #F20505 0%, #8C0783 100%)',
    professor: 'linear-gradient(135deg, #5708A6 0%, #430ABF 100%)',
    performer: 'linear-gradient(135deg, #FA33A1 0%, #F27405 100%)'
  };
  var NIVEL_DO_TIPO = { 'Free': 'fundamentos', 'Iniciante': 'iniciante', 'Intermediário': 'intermediario', 'Técnico': 'tecnico' };
  var STATUS_NV = [
    { id: '',         txt: 'Todos' },
    { id: 'aprovado', txt: 'Aprovados' },
    { id: 'pendente', txt: 'Aguardando' },
    { id: 'recusado', txt: 'Recusados' }
  ];

  function niveisDoMembro(d, v) {
    var est = d.estrutura || [], tipos = (d.membro && d.membro.tipos) || [];
    var tem = function (origem, grupo) {
      return v.lista.some(function (x) { return x.origem === origem && x.grupo === grupo; }) ||
             est.some(function (e) { return e.origem === origem && e.grupo === grupo; });
    };
    var lista = [];
    Object.keys(TRILHAS).forEach(function (id) {
      var doTipo = tipos.some(function (t) { return NIVEL_DO_TIPO[t] === id; });
      if (tem('trilha', id) || doTipo) lista.push({ origem: 'trilha', grupo: id });
    });
    var perfis = {};
    v.lista.forEach(function (x) { if (x.origem === 'talentos') perfis[x.grupo] = true; });
    est.forEach(function (e) { if (e.origem === 'talentos') perfis[e.grupo] = true; });
    var TAL = win.UDX_TALENTOS;
    if (tipos.indexOf('Estagiário(a)') !== -1 && TAL && TAL.perfis) TAL.perfis.forEach(function (p) { perfis[p.id] = true; });
    var ordemTal = TAL && TAL.perfis ? TAL.perfis.map(function (p) { return p.id; }) : [];
    Object.keys(perfis).sort(function (a, b) { return ordemTal.indexOf(a) - ordemTal.indexOf(b); })
      .forEach(function (p) { lista.push({ origem: 'talentos', grupo: p }); });
    return lista.map(function (n) { return montarNivel(d, v, n.origem, n.grupo); });
  }

  function montarNivel(d, v, origem, grupo) {
    var cfg = (d.config && d.config.trilhas) || {}, porPonto = (d.config && d.config.xpPorPonto) || 100;
    var desafios = v.lista.filter(function (x) { return x.origem === origem && x.grupo === grupo; });
    var c = { aprovado: 0, pendente: 0, recusado: 0 };
    desafios.forEach(function (x) { c[x.status] = (c[x.status] || 0) + 1; });
    var est = (d.estrutura || []).filter(function (e) { return e.origem === origem && e.grupo === grupo; });
    var total = est.reduce(function (s, e) { return s + (Number(e.total) || 0); }, 0);
    var xp = origem === 'talentos' ? (v.xpTalento[grupo] || 0) : (v.xpTrilha[grupo] || 0);
    var n = { chave: origem + '|' + grupo, origem: origem, grupo: grupo, desafios: desafios, cont: c, total: total, xp: xp };

    if (origem === 'trilha') {
      var lim = (cfg[grupo] && cfg[grupo].limiar) || 0;
      var insig = ((d.titulos && d.titulos.insignias) || []).some(function (i) { return cfg[grupo] && i.id === cfg[grupo].insignia; });
      n.nome = rotuloGrupo('trilha', grupo, d.nomes || {});
      n.icone = insig ? 'mdi-medal' : 'mdi-stairs-up';
      n.lim = lim; n.pct = lim ? Math.min(100, (xp / lim) * 100) : 0; n.insignia = insig;
      n.valor = '<strong>' + fmt(xp) + '</strong> de ' + fmt(lim) + ' XPE';
      n.estado = !desafios.length ? 'Não iniciado'
        : n.pct >= 100 ? 'Nível concluído'
        : 'Faltam ' + fmt(Math.max(0, lim - xp)) + ' XPE';
      n.rank = d.ranking && d.ranking[grupo];
      n.pagina = TRILHAS[grupo] ? TRILHAS[grupo].pagina : '/membros/';
      n.central = '/membros/desafios/?arvore=' + encodeURIComponent(grupo);
      /* partes = cards do nível (estrutura) com aprovados/aguardando de cada um */
      n.partes = est.map(function (e) {
        var ok = 0, pd = 0;
        desafios.forEach(function (x) { if (x.card === e.card) { if (x.status === 'aprovado') ok++; else if (x.status === 'pendente') pd++; } });
        return { id: e.card || '', nome: e.card_nome || e.card || 'Card', total: Number(e.total) || 0, ok: ok, pend: pd };
      });
      n.tituloPartes = 'Cards do nível';
    } else {
      var pontos = Math.floor(xp / porPonto), resto = xp % porPonto;
      var TAL = win.UDX_TALENTOS, perfil = null;
      ((TAL && TAL.perfis) || []).forEach(function (p) { if (p.id === grupo) perfil = p; });
      var aloc = (d.plano && d.plano.alocacao) || {};
      var habs = perfil ? perfil.habilidades.filter(function (h) { return h.tipo !== 'titulo' && h.tipo !== 'transversal'; }) : [];
      var gastos = habs.reduce(function (s2, h) { return s2 + Math.min(Number(aloc[h.id]) || 0, h.ranksMax); }, 0);
      var dominadas = habs.filter(function (h) { return (Number(aloc[h.id]) || 0) >= h.ranksMax; }).length;
      var tiers = perfil ? perfil.tiers.slice().sort(function (a, b) { return a.n - b.n; }) : [];
      var faixa = null, prox = null;
      tiers.forEach(function (t) { if (gastos >= t.requisito) faixa = t; else if (!prox) prox = t; });
      var tit = perfil ? perfil.habilidades.filter(function (h) { return h.tipo === 'titulo'; })[0] : null;
      var titOk = tit && ((d.titulos && d.titulos.talentos) || []).some(function (x) { return x.id === tit.id; });
      n.nome = (perfil && perfil.nome) || rotuloGrupo('talentos', grupo, d.nomes || {}).replace(/^Profissionalização, /, '');
      n.segmento = perfil && perfil.segmento;
      n.cor = COR_PERFIL[grupo] || '';
      n.icone = titOk ? 'mdi-trophy-variant' : ((perfil && perfil.icone) || 'mdi-family-tree');
      n.pct = (resto / porPonto) * 100;
      n.valor = '<strong>' + fmt(xp) + '</strong> XP';
      n.estado = (n.segmento ? n.segmento + '. ' : '') + (titOk ? 'Título conquistado: ' + tit.nome
        : (faixa ? 'Faixa ' + faixa.n + ', ' + faixa.nome : 'Faixa 1') + '. ' + plural(Math.max(0, pontos - gastos), 'ponto livre', 'pontos livres'));
      n.insignia = titOk;
      n.pontos = pontos; n.gastos = gastos; n.livres = Math.max(0, pontos - gastos);
      n.dominadas = dominadas; n.totalHabs = habs.length;
      n.faixa = faixa; n.proxFaixa = prox; n.titulo = tit; n.tituloOk = titOk; n.perfilNome = perfil ? perfil.nome : grupo;
      n.semAcesso = ((d.membro && d.membro.tipos) || []).indexOf('Estagiário(a)') === -1;
      n.rank = d.ranking && d.ranking.talentos;
      n.pagina = PAGINA_TALENTOS;
      n.central = '/membros/desafios/?arvore=talentos';
      /* partes = todas as habilidades da árvore, na ordem das faixas, com o nível investido no plano */
      n.partes = habs.slice().sort(function (a, b) { return a.tier - b.tier || a.col - b.col; }).map(function (h) {
        var ok = 0, pd = 0;
        desafios.forEach(function (x) { if (x.hab === h.id) { if (x.status === 'aprovado') ok++; else if (x.status === 'pendente') pd++; } });
        var r = Math.min(Number(aloc[h.id]) || 0, h.ranksMax);
        var faixaH = tiers.filter(function (t) { return t.n === h.tier; })[0];
        return { id: h.id, nome: h.nome, total: (h.desafios || []).length, ok: ok, pend: pd, porHab: true,
                 rank: r, ranksMax: h.ranksMax, faixa: faixaH ? faixaH.nome : 'Faixa ' + h.tier, aberta: gastos >= (faixaH ? faixaH.requisito : 0) };
      });
      n.tituloPartes = 'Habilidades da árvore';
    }
    return n;
  }

  /* Três seções usam o mesmo painel, uma por etapa: "Fundamentos" (Nível Free),
     "Formação" (Iniciante, Intermediário e Técnico) e "Profissionalização"
     (Árvores de Talentos do Estágio). Cada uma lembra o seu item aberto e tem
     filtros próprios. */
  var SECOES = {
    pfNiveis: { etapa: 'fundamentos', pref: 'nivel', est: 'nv', bloco: '#blNiveis',
                vazio: 'Seus níveis aparecem aqui quando você começar uma trilha. <a href="/membros/">Escolher uma trilha</a>' },
    pfForm:   { etapa: 'formacao',    pref: 'form',  est: 'fv', bloco: '#blForm', vazio: '' },
    pfProf:   { etapa: 'talentos',    pref: 'prof',  est: 'pv', bloco: '#blProf', vazio: '' }
  };
  function itensDaSecao(id, d, v) {
    return niveisDoMembro(d, v).filter(function (n) { return etapaDe(n.origem, n.grupo) === SECOES[id].etapa; });
  }

  function renderNiveis(d, v) {
    var fund = itensDaSecao('pfNiveis', d, v), form = itensDaSecao('pfForm', d, v), prof = itensDaSecao('pfProf', d, v);
    /* Cada etapa aparece quando tem itens. Fundamentos guarda o aviso de "nenhuma
       trilha" e só some quando outra etapa já tem conteúdo. */
    $('#blNiveis').hidden = !fund.length && !!(form.length || prof.length);
    $('#blForm').hidden = !form.length;
    $('#blProf').hidden = !prof.length;
    var concluidos = form.filter(function (n) { return n.insignia || n.pct >= 100; }).length;
    $('#pfFormCont').textContent = form.length ? fmt(concluidos) + ' de ' + fmt(FORMACAO.length) + ' concluídos' : '';
    renderSecao('pfNiveis', d, fund);
    renderSecao('pfForm', d, form);
    renderSecao('pfProf', d, prof);
  }

  function renderSecao(id, d, itens) {
    var cfg = SECOES[id], caixa = $('#' + id);
    if (!itens.length) { caixa.innerHTML = cfg.vazio ? '<div class="pf-vazio">' + cfg.vazio + '</div>' : ''; return; }
    if (prefs[cfg.pref] && !itens.some(function (n) { return n.chave === prefs[cfg.pref]; })) prefs[cfg.pref] = '';
    caixa.innerHTML = '<div class="pf-niveis">' + itens.map(function (n, i) {
      var aberto = n.chave === prefs[cfg.pref], idp = id + 'P' + i;
      return '<div class="pf-nivel' + (aberto ? ' is-aberto' : '') + '" data-chave="' + esc(n.chave) + '"' + (n.cor ? ' style="--nv-grad:' + n.cor + '"' : '') + '>' +
        '<button type="button" class="pf-nivel__cab" aria-expanded="' + aberto + '" aria-controls="' + idp + '">' +
          '<span class="pf-nivel__ico" aria-hidden="true"><span class="mdi ' + n.icone + '"></span></span>' +
          '<span class="pf-nivel__nome">' + esc(n.nome) +
            (n.insignia ? ' <span class="pf-selo"><span class="mdi mdi-medal" aria-hidden="true"></span>' + (n.origem === 'trilha' ? 'insígnia' : 'título') + '</span>' : '') +
            '<small>' + esc(n.estado) + '</small></span>' +
          '<span class="pf-nivel__valor">' + n.valor + '</span>' +
          '<span class="mdi mdi-chevron-down pf-nivel__seta" aria-hidden="true"></span>' +
          '<span class="pf-trilho pf-nivel__trilho" role="img" aria-label="' + Math.round(n.pct) + '%"><i class="xp" style="width:' + n.pct.toFixed(1) + '%"></i></span>' +
        '</button>' +
        '<div class="pf-nivel__painel" id="' + idp + '"' + (aberto ? '' : ' hidden') + '>' + (aberto ? painelNivel(d, n, estado[cfg.est]) : '') + '</div>' +
      '</div>';
    }).join('') + '</div>';
  }

  function painelNivel(d, n, f) {
    var rk = n.rank;
    var stats = n.origem === 'trilha'
      ? mini(Math.round(n.pct) + '%', 'do XPE do nível') +
        mini(fmt(n.cont.aprovado) + (n.total ? '<small> de ' + fmt(n.total) + '</small>' : ''), 'desafios aprovados') +
        mini(fmt(n.cont.pendente), 'aguardando validação') +
        mini(rk && rk.pos ? rk.pos + 'º<small> de ' + fmt(rk.participantes) + '</small>' : '—', 'no ranking do ' + n.nome)
      : mini(fmt(n.livres) + '<small> de ' + fmt(n.pontos) + '</small>', 'pontos de talento livres') +
        mini(fmt(n.dominadas) + '<small> de ' + fmt(n.totalHabs) + '</small>', 'habilidades dominadas') +
        mini(fmt(n.cont.aprovado) + (n.total ? '<small> de ' + fmt(n.total) + '</small>' : ''), 'desafios aprovados') +
        mini(rk && rk.pos ? rk.pos + 'º<small> de ' + fmt(rk.participantes) + '</small>' : '—', 'no ranking da Profissionalização');

    /* Árvore de Talentos: faixa, título e plano salvo */
    var plano = '';
    if (n.origem === 'talentos') {
      var pl = d.plano;
      var faixaTxt = n.proxFaixa
        ? 'Faixa ' + (n.faixa ? n.faixa.n : 1) + ' aberta. Invista mais ' + plural(n.proxFaixa.requisito - n.gastos, 'ponto', 'pontos') + ' para abrir a faixa ' + n.proxFaixa.n + ', ' + n.proxFaixa.nome + '.'
        : 'Todas as faixas abertas.';
      var titTxt = !n.titulo ? '' : n.tituloOk
        ? 'Título conquistado: <b>' + esc(n.titulo.nome) + '</b>. A promoção é definida pela coordenação após o Checkpoint de avanço.'
        : 'Título da árvore: <b>' + esc(n.titulo.nome) + '</b>. Requer ' + esc((n.titulo.requer || []).map(function (id) {
            var h = win.UDX_TALENTOS && win.UDX_TALENTOS.indice[id]; return h ? h.nome : id; }).join(' e ')) + ' no nível máximo.';
      plano = '<div class="pf-plano">' +
        '<p><span class="mdi mdi-layers-triple-outline" aria-hidden="true"></span>' + esc(faixaTxt) + '</p>' +
        (titTxt ? '<p><span class="mdi ' + (n.tituloOk ? 'mdi-trophy-variant' : 'mdi-trophy-outline') + '" aria-hidden="true"></span>' + titTxt + '</p>' : '') +
        '<p><span class="mdi mdi-content-save-outline" aria-hidden="true"></span>' + (pl
          ? 'Distribuição do plano salvo "' + esc(pl.nome || 'Plano') + '"' + (pl.paginas > 1 ? ' (você tem ' + pl.paginas + ' planos)' : '') + ': ' + plural(n.gastos, 'ponto investido', 'pontos investidos') + ' nesta árvore.'
          : 'Você ainda não salvou um plano. Os níveis das habilidades aparecem aqui depois do primeiro "Salvar plano".') + '</p>' +
        (n.semAcesso ? '<p class="pf-plano__aviso"><span class="mdi mdi-lock-outline" aria-hidden="true"></span>As Árvores de Talentos são exclusivas do Estágio. Seu histórico continua guardado aqui.</p>' : '') +
      '</div>';
    }

    var partes = n.partes.length
      ? '<h3 class="pf-ev-grupo">' + esc(n.tituloPartes) + '</h3><div class="pf-partes">' + n.partes.map(function (p) {
          var okP = p.total ? (p.ok / p.total) * 100 : 0, pdP = p.total ? (p.pend / p.total) * 100 : 0;
          var ativo = f.parte === p.id;
          return '<button type="button" class="pf-parte' + (p.porHab && !p.aberta ? ' is-fechada' : '') + '" data-nv-parte="' + esc(p.id) + '" aria-pressed="' + ativo + '">' +
            '<span class="pf-linha__topo"><strong>' + esc(p.nome) + '</strong><span class="pf-linha__valor">' + p.ok + ' de ' + p.total + '</span></span>' +
            (p.porHab ? '<span class="pf-parte__nivel">' + esc(p.faixa) + '. Nível ' + p.rank + ' de ' + p.ranksMax +
              (p.rank >= p.ranksMax ? ', dominada' : p.aberta ? '' : ', faixa fechada') + '</span>' : '') +
            '<span class="pf-trilho">' + (okP ? '<i class="ok" style="width:' + okP.toFixed(1) + '%"></i>' : '') + (pdP ? '<i class="pend" style="width:' + pdP.toFixed(1) + '%"></i>' : '') + '</span>' +
          '</button>';
        }).join('') + '</div>' +
        '<p class="pf-linha__nota">Toque em ' + (n.origem === 'trilha' ? 'um card' : 'uma habilidade') + ' para ver só os desafios ' + (n.origem === 'trilha' ? 'dele' : 'dela') + '. A barra mostra desafios aprovados e aguardando.</p>'
      : '';

    var itens = n.desafios.filter(function (x) {
      if (f.status && x.status !== f.status) return false;
      if (f.parte && (n.origem === 'trilha' ? x.card : x.hab) !== f.parte) return false;
      return true;
    }).sort(function (a, b) { return ((b.avaliado || b.enviado) || 0) - ((a.avaliado || a.enviado) || 0); });

    var chips = '<div class="pf-seg" role="group" aria-label="Situação dos desafios do nível">' + STATUS_NV.map(function (s) {
      var q = s.id ? n.cont[s.id] || 0 : n.desafios.length;
      return '<button type="button" data-nv-status="' + s.id + '" aria-pressed="' + (f.status === s.id) + '">' + s.txt + '<span class="pf-cont">' + q + '</span></button>';
    }).join('') + '</div>';

    var lista = itens.length
      ? '<ul class="pf-lista">' + itens.slice(0, f.mostrar).map(function (x) {
          var tp = TIPOS[x.tipo] || TIPOS.tarefa;
          var qd = x.status === 'pendente' ? 'Enviado ' + quando(x.enviado) : (x.status === 'aprovado' ? 'Aprovado ' : 'Recusado ') + quando(x.avaliado || x.enviado);
          return '<li class="pf-item pf-item--curto" data-status="' + esc(x.status) + '">' +
            '<span class="pf-item__ico" title="' + esc(tp.label) + '"><span class="mdi ' + tp.icone + '" aria-hidden="true"></span></span>' +
            '<div style="min-width:0"><span class="pf-item__nome">' + esc(x.nome) + '</span>' +
              '<span class="pf-item__ctx">' + esc((x.habNome ? x.habNome + '. ' : '') + qd) + '</span>' +
              (x.parecer ? '<span class="pf-item__parecer">' + esc(x.parecer) + '</span>' : '') + '</div>' +
            '<div class="pf-item__dir"><span class="pf-xp">+' + fmt(x.xp) + ' ' + unidadeXp(x.origem) + '</span>' +
              '<a class="pf-abrir" href="' + esc(linkDesafio(x)) + '">Abrir</a></div>' +
          '</li>';
        }).join('') + '</ul>' +
        (itens.length > f.mostrar ? '<button type="button" class="pf-mais" data-nv-mais>Mostrar mais ' + Math.min(6, itens.length - f.mostrar) + ' de ' + (itens.length - f.mostrar) + ' restantes</button>' : '')
      : '<div class="pf-vazio">' + (n.desafios.length ? 'Nenhum desafio com esse filtro.' : (n.origem === 'trilha' ? 'Você ainda não enviou desafios neste nível.' : 'Você ainda não enviou desafios nesta árvore.') + (n.total ? ' São ' + fmt(n.total) + ' desafios ao todo.' : '')) + '</div>';

    return '<div class="pf-nivel__stats">' + stats + '</div>' + plano +
      '<div class="pf-nivel__corpo">' +
        (partes ? '<div class="pf-nivel__partes">' + partes + '</div>' : '') +
        '<div class="pf-nivel__desafios"><h3 class="pf-ev-grupo">' + (n.origem === 'trilha' ? 'Desafios do nível' : 'Desafios da árvore') + '</h3>' + chips + lista + '</div>' +
      '</div>' +
      '<div class="pf-nivel__acoes">' +
        (n.semAcesso ? '' : '<a class="pf-topo-btn" href="' + esc(n.pagina) + '"><span class="mdi mdi-map-marker-path" aria-hidden="true"></span>' + (n.origem === 'trilha' ? (n.desafios.length ? 'Continuar a trilha' : 'Começar a trilha') : 'Abrir a árvore e distribuir pontos') + '</a>') +
        '<a class="pf-topo-btn" href="' + esc(n.central) + '"><span class="mdi mdi-flag-checkered" aria-hidden="true"></span>Ver na central de desafios</a>' +
      '</div>';

    function mini(valor, rotulo) { return '<div class="pf-num"><b>' + valor + '</b><span>' + esc(rotulo) + '</span></div>'; }
  }

  function atualizarPainelAberto(id, d, v) {
    var el = $('#' + id + ' .pf-nivel.is-aberto'); if (!el) return;
    var n = itensDaSecao(id, d, v).filter(function (x) { return x.chave === el.getAttribute('data-chave'); })[0];
    if (n) $('.pf-nivel__painel', el).innerHTML = painelNivel(d, n, estado[SECOES[id].est]);
  }


  /* ================================================================
     RANKING
  ================================================================ */
  function rotuloEscopo(id, d) {
    if (id === 'geral') return 'Geral';
    if (id === 'talentos') return 'Profissionalização (Árvores de Talentos)';
    return (TRILHAS[id] && TRILHAS[id].rotulo) || (d.nomes && d.nomes.niveis && d.nomes.niveis[id]) || id;
  }
  function renderRanking(d) {
    var rk = d.ranking, caixa = $('#pfRanking'), sel = $('#pfRankEscopo');
    if (!rk) { caixa.innerHTML = '<div class="pf-vazio">O ranking não pôde ser carregado agora.</div>'; sel.hidden = true; return; }
    /* Um ranking por nível, agrupado pela etapa da jornada. */
    var grupos = [
      { rotulo: '',                   ids: ['geral'] },
      { rotulo: 'Fundamentos',        ids: ['fundamentos'] },
      { rotulo: 'Formação',           ids: FORMACAO },
      { rotulo: 'Profissionalização', ids: ['talentos'] }
    ].map(function (g) {
      return { rotulo: g.rotulo, ids: g.ids.filter(function (k) { return k === 'geral' || rk[k]; }) };
    }).filter(function (g) { return g.ids.length; });
    var ids = [].concat.apply([], grupos.map(function (g) { return g.ids; }));
    if (ids.indexOf(prefs.escopo) === -1) prefs.escopo = 'geral';
    var opcao = function (id) {
      return '<option value="' + id + '"' + (id === prefs.escopo ? ' selected' : '') + '>' +
        esc(id === 'talentos' ? 'Árvores de Talentos' : rotuloEscopo(id, d)) + '</option>';
    };
    sel.innerHTML = grupos.map(function (g) {
      return g.rotulo ? '<optgroup label="' + esc(g.rotulo) + '">' + g.ids.map(opcao).join('') + '</optgroup>' : g.ids.map(opcao).join('');
    }).join('');
    sel.hidden = ids.length < 2;
    var etapaRk = prefs.escopo === 'geral' ? '' : { fundamentos: 'Fundamentos', formacao: 'Formação', talentos: 'Profissionalização' }[etapaDe(prefs.escopo === 'talentos' ? 'talentos' : 'trilha', prefs.escopo)];

    var r = rk[prefs.escopo] || { participantes: 0, xp: 0, pos: null, faltam: 0, top: [] };
    var un = prefs.escopo === 'talentos' ? 'XP' : prefs.escopo === 'geral' ? 'XP' : 'XPE';
    var lider = (r.top[0] && r.top[0].xp) || 1;
    var html = '<p class="pf-rank__escopo">' + (prefs.escopo === 'geral'
      ? 'Ranking geral: todo o XP aprovado nas trilhas de nível e nas Árvores de Talentos.'
      : '<b>' + esc(etapaRk) + '</b> · ' + esc(prefs.escopo === 'talentos' ? 'Árvores de Talentos' : rotuloEscopo(prefs.escopo, d)) +
        ': conta só o ' + un + ' aprovado ' + (prefs.escopo === 'talentos' ? 'nas árvores' : 'neste nível') + '.') + '</p>';
    if (r.pos) {
      html += '<div class="pf-rank__pos"><b>' + r.pos + 'º</b><span>de ' + plural(r.participantes, 'membro com pontuação', 'membros com pontuação') + '</span></div>' +
        '<p class="pf-rank__dica">' + (r.pos === 1 ? 'Você lidera este ranking.' : 'Faltam <b>' + fmt(r.faltam) + ' ' + un + '</b> para subir uma posição.') + '</p>';
    } else {
      html += '<p class="pf-rank__dica">Você entra neste ranking quando tiver o primeiro desafio aprovado' +
        (r.participantes ? '. Hoje ' + plural(r.participantes, 'membro pontua', 'membros pontuam') + ' aqui.' : '.') + '</p>';
    }
    var temVoce = r.top.some(function (t) { return t.voce; });
    var linhas = r.top.map(function (t) { return linhaRank(t.pos, t.iniciais, t.xp, t.voce); });
    if (!temVoce && r.pos) {
      linhas.push('<li class="sep" aria-hidden="true">⋯</li>');
      linhas.push(linhaRank(r.pos, iniciais(d.membro && d.membro.nome, d.membro && d.membro.email), r.xp, true));
    }
    html += r.top.length ? '<ol class="pf-podio">' + linhas.join('') + '</ol>' : '';
    caixa.innerHTML = html;

    function linhaRank(pos, ini, xp, voce) {
      return '<li class="' + (voce ? 'is-voce' : '') + '">' +
        '<span class="n">' + pos + 'º</span>' +
        '<span class="av" aria-hidden="true">' + esc(ini) + '</span>' +
        '<div><div class="pf-linha__topo"><strong>' + (voce ? 'Você' : (ini === '?' ? 'Membro' : 'Membro ' + esc(ini))) + '</strong><span class="pf-linha__valor">' + fmt(xp) + ' ' + un + '</span></div>' +
        '<div class="pf-trilho"><i class="' + (voce ? 'xp' : 'ok') + '" style="width:' + Math.max(2, (xp / lider) * 100).toFixed(1) + '%;' + (voce ? '' : 'background:rgba(223,224,242,.35)') + '"></i></div></div>' +
      '</li>';
    }
  }

  /* ================================================================
     TÍTULOS E INSÍGNIAS
  ================================================================ */
  function nomeTituloRep(id) {
    var R = win.UDX_REP;
    if (!R) return null;
    var listas = [].concat(R.titulosReputacao || [], R.titulosDesempenho || [], R.titulosTransversais || []);
    for (var i = 0; i < listas.length; i++) if (listas[i].id === id) return listas[i];
    return null;
  }
  function renderTitulos(d) {
    var cards = [];
    var t = d.titulos || {};
    var INS = win.UDX_INSIGNIAS;
    (t.insignias || []).forEach(function (i) {
      var meta = INSIGNIAS[i.id] || { nome: i.id, icone: 'mdi-medal-outline' };
      var arte = INS && INS.porInsigniaTrilha[i.id];
      var em = data(i.em);
      cards.push(card(meta.icone, arte ? arte.titulo : meta.nome, ((TRILHAS[i.grupo] && TRILHAS[i.grupo].rotulo) || i.grupo) + (em ? ', ' + diaCurto(em) + ' de ' + em.getFullYear() : ''), null, arte && arte.img));
    });
    /* Insígnias que não vêm de trilha (Profissional, Participação). */
    insEstados.forEach(function (s) {
      if (!s.ok || s.b.regra.tipo === 'trilha') return;
      cards.push(card('mdi-shield-crown-outline', s.b.titulo,
        s.b.regra.tipo === 'evento' ? 'Eventos' + (s.em ? ', ' + diaCurto(s.em) + ' de ' + s.em.getFullYear() : '') : 'Profissionalização', null, s.b.img));
    });
    var T = win.UDX_TALENTOS, idx = (T && T.indice) || {};
    (t.talentos || []).forEach(function (x) {
      var n = idx[x.id] || {};
      cards.push(card(n.icone || 'mdi-crown-outline', n.nome || x.id, rotuloGrupo('talentos', x.grupo, d.nomes || {}), null));
    });
    /* Multiestilo (talent_rep_titulos.eixo = 'multiestilo', id <titulo>-<tier>):
       um card por título, com o tier mais alto conquistado. */
    var TT = win.UDX_TITULOS, maiorTier = {};
    ((d.reputacao && d.reputacao.titulos) || []).forEach(function (x) {
      if (x.eixo !== 'multiestilo' || !TT) return;
      var sep = TT.separarTier(x.titulo_id);
      if (!maiorTier[sep.base] || sep.tier > maiorTier[sep.base].tier) maiorTier[sep.base] = { tier: sep.tier, escopo: x.escopo };
    });
    Object.keys(maiorTier).forEach(function (base) {
      var meta = (TT.indice[base] || {}).titulo || {};
      cards.push(card(meta.icone || 'mdi-earth', TT.nomeTitulo(base, { tier: maiorTier[base].tier }),
        'Multiestilo · ' + rotuloGrupo('talentos', maiorTier[base].escopo, d.nomes || {}).replace(/^Profissionalização, /, ''), meta.cor));
    });
    ((d.reputacao && d.reputacao.titulos) || []).forEach(function (x) {
      if (x.eixo === 'multiestilo') return;
      var r = nomeTituloRep(x.titulo_id);
      var escopo = win.UDX_REP && win.UDX_REP.perfilLabel ? win.UDX_REP.perfilLabel(x.escopo) : x.escopo;
      cards.push(card((r && r.icone) || 'mdi-shield-star-outline', (r && r.nome) || x.titulo_id,
        'Reputação' + (escopo && escopo !== 'Geral' ? ', ' + escopo : ''), r && r.cor));
    });
    $('#pfTitulos').innerHTML = cards.length
      ? '<div class="pf-titulos">' + cards.join('') + '</div>'
      : '<div class="pf-vazio">Nenhum título ainda. Insígnias chegam ao concluir um nível; títulos, pela Árvore de Talentos e pelas avaliações de desempenho.</div>';

    function card(ic, nome, origem, cor, img) {
      return '<div class="pf-titulo"' + (cor ? ' style="--tit-cor:' + esc(cor) + '"' : '') + '>' +
        (img ? '<span class="pf-titulo__ico is-arte"><img src="' + esc(img) + '" alt="" width="44" height="44" loading="lazy" decoding="async"></span>'
             : '<span class="pf-titulo__ico"><span class="mdi ' + esc(ic) + '" aria-hidden="true"></span></span>') +
        '<b>' + esc(nome) + '</b><span>' + esc(origem) + '</span></div>';
    }
  }

  /* ================================================================
     INSÍGNIAS — catálogo (/js/insignias.data.js) × o que o membro já tem.
     Nada novo na API: usa titulos.insignias, titulos.talentos, eventos,
     plano e config.trilhas, que /api/perfil/resumo já devolve.
  ================================================================ */
  var CHAVE_VISTAS = 'udx:insignias:vistas';
  var vistas = {};
  try { vistas = JSON.parse(win.localStorage.getItem(CHAVE_VISTAS) || '{}') || {}; } catch (e) { vistas = {}; }
  function marcarVista(id) {
    if (vistas[id]) return false;
    vistas[id] = 1;
    try { win.localStorage.setItem(CHAVE_VISTAS, JSON.stringify(vistas)); } catch (e) {}
    return true;
  }

  function estadoInsignias(d, v) {
    var INS = win.UDX_INSIGNIAS;
    if (!INS || !d) return [];
    var cfg = (d.config && d.config.trilhas) || {};
    var tit = d.titulos || {};
    var tipos = (d.membro && d.membro.tipos) || [];
    var TAL = win.UDX_TALENTOS;
    var agora = new Date();

    return INS.lista.map(function (b) {
      var r = b.regra;
      var s = { b: b, ok: false, em: null, pct: 0, progresso: '', dica: '', link: null, linkTxt: '' };

      if (r.tipo === 'trilha') {
        var ins = (tit.insignias || []).filter(function (i) { return i.id === r.insignia; })[0];
        var lim = (cfg[r.trilha] && cfg[r.trilha].limiar) || 0;
        var xp = (v && v.xpTrilha[r.trilha]) || 0;
        s.ok = !!ins; s.em = ins ? data(ins.em) : null;
        s.pct = s.ok ? 100 : (lim ? Math.min(100, (xp / lim) * 100) : 0);
        s.progresso = lim ? fmt(Math.min(xp, lim)) + ' de ' + fmt(lim) + ' XPE' : fmt(xp) + ' XPE';
        if (!s.ok) {
          s.dica = lim && xp >= lim ? 'Limiar atingido. A insígnia aparece aqui assim que o registro do nível for concluído.'
                 : xp ? 'Faltam ' + fmt(Math.max(0, lim - xp)) + ' XPE.' : 'Você ainda não enviou desafios nesta trilha.';
        }
        s.link = TRILHAS[r.trilha] ? TRILHAS[r.trilha].pagina : null; s.linkTxt = 'Abrir a trilha';

      } else if (r.tipo === 'talentos') {
        var perfis = (TAL && TAL.perfis) || [];
        var idsTitulo = [], nomeTitulo = {};
        perfis.forEach(function (p) {
          p.habilidades.forEach(function (h) { if (h.tipo === 'titulo') { idsTitulo.push(h.id); nomeTitulo[h.id] = h.nome; } });
        });
        var meus = (tit.talentos || []).filter(function (x) { return !idsTitulo.length || idsTitulo.indexOf(x.id) !== -1; });
        s.ok = meus.length > 0;
        var estag = tipos.indexOf('Estagiário(a)') !== -1;
        if (s.ok) {
          s.pct = 100;
          s.progresso = meus.map(function (x) { return nomeTitulo[x.id] || x.id; }).join(', ');
        } else if (estag && perfis.length) {
          var aloc = (d.plano && d.plano.alocacao) || {}, melhor = null;
          perfis.forEach(function (p) {
            var habs = p.habilidades.filter(function (h) { return h.tipo !== 'titulo' && h.tipo !== 'transversal'; });
            var titH = p.habilidades.filter(function (h) { return h.tipo === 'titulo'; })[0];
            var faixa = titH ? p.tiers.filter(function (t) { return t.n === titH.tier; })[0] : null;
            var req = (faixa && faixa.requisito) || 0;
            var gastos = habs.reduce(function (s2, h) { return s2 + Math.min(Number(aloc[h.id]) || 0, h.ranksMax); }, 0);
            var pct = req ? Math.min(100, (gastos / req) * 100) : 0;
            if (!melhor || pct > melhor.pct) melhor = { nome: p.nome, gastos: gastos, req: req, pct: pct };
          });
          if (melhor) {
            s.pct = melhor.pct;
            s.progresso = fmt(Math.min(melhor.gastos, melhor.req)) + ' de ' + fmt(melhor.req) + ' pontos na árvore mais avançada (' + melhor.nome + ')';
          }
          s.dica = 'Com os pontos da faixa do título, falta ser aprovado(a) no desafio do título da árvore.';
          s.link = PAGINA_TALENTOS; s.linkTxt = 'Abrir a Árvore de Talentos';
        } else {
          s.dica = 'Disponível a partir de Estagiário(a), depois das trilhas de nível.';
        }

      } else if (r.tipo === 'evento') {
        var evs = (d.eventos || []).map(function (e) { return { situacao: e.situacao, inicio: data(e.inicio), fim: data(e.fim) }; });
        var pres = evs.filter(function (e) { return e.situacao === 'presente' && e.inicio; })
                      .sort(function (a, b) { return a.inicio - b.inicio; });
        var insc = evs.filter(function (e) { return e.situacao === 'inscrito' && e.inicio && (e.fim || e.inicio) >= agora; }).length;
        s.ok = pres.length > 0; s.em = s.ok ? pres[0].inicio : null;
        s.pct = s.ok ? 100 : 0;
        s.progresso = s.ok ? plural(pres.length, 'presença confirmada', 'presenças confirmadas') : '0 de 1 presença confirmada';
        if (!s.ok) s.dica = insc ? 'Você tem ' + plural(insc, 'inscrição', 'inscrições') + ' em eventos próximos. A presença confirmada libera a insígnia.'
                                 : 'Inscreva-se em um encontro presencial ou on-line da Up Dance.';
        s.link = '#tEventos'; s.linkTxt = 'Ver seus eventos';
      }

      s.nova = s.ok && !vistas[b.id];
      return s;
    });
  }

  function htmlInsignia(s, tam, grande) {
    var b = s.b, src = grande ? b.imgGrande : b.img;
    return '<span class="udx-insignia' + (s.ok ? '' : ' is-bloqueada') + (s.nova ? ' is-nova' : '') + '"' +
      ' style="--src:url(\'' + esc(src) + '\');--cor:' + esc(b.cor) + ';--tam:' + tam + ';--atraso:' + (grande ? 0 : (win.UDX_INSIGNIAS.lista.indexOf(b) * .6)).toFixed(1) + 's">' +
      '<img src="' + esc(src) + '" alt="" width="256" height="256"' + (grande ? '' : ' loading="lazy"') + ' decoding="async"></span>';
  }

  var insEstados = [];
  function renderInsignias(d, v) {
    insEstados = estadoInsignias(d, v);
    var caixa = $('#pfInsignias');
    var filtro = prefs.ins || '';
    $$('#pfInsFiltro button').forEach(function (bt) { bt.setAttribute('aria-pressed', String((bt.getAttribute('data-ins') || '') === filtro)); });
    if (!insEstados.length) {
      caixa.innerHTML = '<div class="pf-vazio">Não foi possível carregar o catálogo de insígnias agora.</div>';
      $('#pfInsCont').textContent = '';
      return;
    }
    var ganhas = insEstados.filter(function (s) { return s.ok; }).length;
    $('#pfInsCont').textContent = fmt(ganhas) + ' de ' + fmt(insEstados.length);
    var lista = insEstados.filter(function (s) {
      return !filtro || (filtro === 'conquistada' ? s.ok : !s.ok);
    });
    if (!lista.length) {
      caixa.innerHTML = '<div class="pf-vazio">' + (filtro === 'conquistada'
        ? 'Nenhuma insígnia conquistada ainda. Concluir o Nível Free é o primeiro passo.'
        : 'Você conquistou todas as insígnias disponíveis.') + '</div>';
      return;
    }
    caixa.innerHTML = '<ul class="pf-ins-grade">' + lista.map(function (s) {
      var b = s.b;
      var estado = s.ok
        ? '<span class="pf-ins__estado is-ok"><span class="mdi mdi-check-decagram" aria-hidden="true"></span>' +
            (s.em ? 'Conquistada em ' + diaCurto(s.em) + ' de ' + s.em.getFullYear() : 'Conquistada') + '</span>'
        : '<span class="pf-ins__estado"><span class="mdi mdi-lock-outline" aria-hidden="true"></span>' +
            (s.pct > 0 ? Math.floor(s.pct) + '% do caminho' : 'A conquistar') + '</span>';
      return '<li><button type="button" class="pf-ins' + (s.ok ? ' is-ok' : '') + '" data-ins-id="' + esc(b.id) + '" style="--cor:' + esc(b.cor) + '"' +
        ' aria-label="' + esc(b.titulo + ', ' + (s.ok ? 'conquistada' : 'a conquistar') + (s.nova ? ', nova' : '')) + '">' +
        (s.nova ? '<span class="pf-ins__nova">Nova</span>' : '') +
        htmlInsignia(s, 'var(--ins-tam)', false) +
        '<b class="pf-ins__nome">' + esc(b.nome) + '</b>' + estado +
        (!s.ok && s.pct > 0 ? '<span class="pf-trilho pf-ins__trilho" aria-hidden="true"><i class="xp" style="width:' + s.pct.toFixed(1) + '%"></i></span>' : '') +
        '</button></li>';
    }).join('') + '</ul>';
    if (win.UDX_SPRITE) win.UDX_SPRITE.observar(caixa);
  }

  /* ---------- diálogo de detalhe ---------- */
  var insAberta = null;
  function abrirInsignia(id) {
    var dlg = $('#pfInsDlg');
    var i = -1;
    insEstados.forEach(function (s, k) { if (s.b.id === id) i = k; });
    if (i < 0 || !dlg) return;
    var s = insEstados[i], b = s.b;
    insAberta = id;
    var novaVista = s.ok && marcarVista(id);
    if (novaVista) s.nova = false;
    var ant = insEstados[(i + insEstados.length - 1) % insEstados.length], prox = insEstados[(i + 1) % insEstados.length];
    $('#pfInsDlgCorpo').innerHTML =
      '<button type="button" class="pf-ins-dlg__fechar" data-ins-fechar aria-label="Fechar"><span class="mdi mdi-close" aria-hidden="true"></span></button>' +
      '<div class="pf-ins-dlg__arte" style="--cor:' + esc(b.cor) + '">' + htmlInsignia(s, 'min(300px, 70vw)', true) + '</div>' +
      '<div class="pf-ins-dlg__info">' +
        '<span class="pf-ins-dlg__chip' + (s.ok ? ' is-ok' : '') + '"><span class="mdi ' + (s.ok ? 'mdi-check-decagram' : 'mdi-lock-outline') + '" aria-hidden="true"></span>' +
          (s.ok ? 'Conquistada' + (s.em ? ' em ' + diaCurto(s.em) + ' de ' + s.em.getFullYear() : '') : 'A conquistar') + '</span>' +
        '<h3 id="pfInsDlgTitulo">' + esc(b.titulo) + '</h3>' +
        '<p class="pf-ins-dlg__como"><b>Como conquistar.</b> ' + esc(b.como) + '</p>' +
        (s.progresso ? '<div class="pf-ins-dlg__prog"><div class="pf-linha__topo"><strong>' + (s.ok && b.regra.tipo === 'talentos' ? 'Título' : 'Progresso') + '</strong>' +
          '<span class="pf-linha__valor">' + esc(s.progresso) + '</span></div>' +
          '<div class="pf-trilho" role="img" aria-label="' + Math.floor(s.pct) + '% concluído"><i class="xp" style="width:' + s.pct.toFixed(1) + '%"></i></div></div>' : '') +
        (s.dica ? '<p class="pf-ins-dlg__dica">' + esc(s.dica) + '</p>' : '') +
        '<div class="pf-ins-dlg__acoes">' +
          (s.link ? '<a class="pf-ins-dlg__link" href="' + esc(s.link) + '"' + (s.link.charAt(0) === '#' ? ' data-ins-fechar' : '') + '>' + esc(s.linkTxt) + '<span class="mdi mdi-arrow-right" aria-hidden="true"></span></a>' : '') +
          '<span class="pf-ins-dlg__nav">' +
            '<button type="button" data-ins-ir="' + esc(ant.b.id) + '" aria-label="Insígnia anterior: ' + esc(ant.b.nome) + '"><span class="mdi mdi-chevron-left" aria-hidden="true"></span></button>' +
            '<span>' + (i + 1) + ' / ' + insEstados.length + '</span>' +
            '<button type="button" data-ins-ir="' + esc(prox.b.id) + '" aria-label="Próxima insígnia: ' + esc(prox.b.nome) + '"><span class="mdi mdi-chevron-right" aria-hidden="true"></span></button>' +
          '</span>' +
        '</div>' +
      '</div>';
    if (!dlg.open) {
      if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    }
    var foco = $('.pf-ins-dlg__fechar', dlg); if (foco) foco.focus();
    if (novaVista) renderInsignias(estado.dados, deriv);
  }
  function fecharInsignia() {
    var dlg = $('#pfInsDlg'), id = insAberta;
    insAberta = null;
    if (!dlg) return;
    if (typeof dlg.close === 'function' && dlg.open) dlg.close(); else dlg.removeAttribute('open');
    var b = id && $('#pfInsignias [data-ins-id="' + id + '"]'); if (b) b.focus();
  }

  /* ================================================================
     REPUTAÇÃO — Desempenho (0–100, banda) e Reputação (pontos)
  ================================================================ */
  function renderReputacao(d) {
    var rep = d.reputacao || { global: { pr: 0, pd: 0, n: 0 }, porPerfil: {} };
    var R = win.UDX_REP;
    var g = rep.global || { pr: 0, pd: 0, n: 0 };
    var caixa = $('#pfReputacao');
    if (!g.n && !Object.keys(rep.porPerfil || {}).length) {
      caixa.innerHTML = '<div class="pf-vazio">Seu desempenho começa a contar a partir da primeira avaliação com nota.</div>';
      return;
    }
    function banda(pd) {
      var b = R && R.bandaDesempenho ? R.bandaDesempenho(pd) : null;
      return b ? '<span class="pf-banda" style="--banda-cor:' + esc(b.cor) + '"><span class="mdi ' + esc(b.icone) + '" aria-hidden="true"></span>' + esc(b.nome) + '</span>'
               : '<span class="pf-banda">Sem banda ainda</span>';
    }
    var html = '<div class="pf-rep">' +
      '<div class="pf-num"><b>' + fmt(g.pd) + '<small style="font-size:.8rem;color:var(--pf-muted)">/100</small></b><span>Desempenho geral, ' + plural(g.n, 'avaliação', 'avaliações') + '</span>' + banda(g.pd) + '</div>' +
      '<div class="pf-num"><b>' + fmt(g.pr) + '</b><span>pontos de reputação acumulados</span></div>' +
    '</div>';
    var perfis = Object.keys(rep.porPerfil || {});
    if (perfis.length) {
      html += '<div class="pf-linhas">' + perfis.map(function (p) {
        var x = rep.porPerfil[p];
        var nome = R && R.perfilLabel ? R.perfilLabel(p) : p;
        return '<div class="pf-linha"><div class="pf-linha__topo"><strong>' + esc(nome) + '</strong>' +
          '<span class="pf-linha__valor">' + fmt(x.pd) + '/100, ' + plural(x.n, 'avaliação', 'avaliações') + '</span></div>' +
          '<div class="pf-trilho" role="img" aria-label="Desempenho ' + x.pd + ' de 100"><i class="xp" style="width:' + Math.min(100, x.pd) + '%"></i></div></div>';
      }).join('') + '</div>';
    }
    caixa.innerHTML = html;
  }

  /* ================================================================
     MONTAGEM, EVENTOS E CARGA
  ================================================================ */
  var deriv = null;
  function renderTudo() {
    var d = estado.dados; deriv = derivar(d);
    renderHero(d, deriv); renderHoje(deriv); renderGrafico(deriv);
    renderDesafios(d, deriv); renderHabilidades(d, deriv); renderEventos(d);
    renderInsignias(d, deriv);
    renderNiveis(d, deriv); renderRanking(d); renderTitulos(d); renderReputacao(d);
    var falhas = d.falhas || [];
    var aviso = $('#pfAviso');
    if (falhas.length) {
      aviso.textContent = 'Parte do painel não carregou agora (' + falhas.join(', ') + '). O restante está atualizado; recarregue a página em instantes.';
      aviso.hidden = false;
    } else aviso.hidden = true;
    $('#pfApp').setAttribute('aria-busy', 'false');
  }

  function ligarEventos() {
    $('#pfPeriodo').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-dias]'); if (!b) return;
      prefs.dias = Number(b.getAttribute('data-dias')); salvarPrefs(); renderGrafico(deriv);
    });
    $('#pfHoje').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-meta]'); if (!b) return;
      prefs.meta = Math.max(1, Math.min(10, (Number(prefs.meta) || 3) + Number(b.getAttribute('data-meta'))));
      salvarPrefs(); renderHoje(deriv);
      var mesmo = $('#pfHoje button[data-meta="' + b.getAttribute('data-meta') + '"]'); if (mesmo) mesmo.focus();
    });
    $('#pfAbas').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-status]'); if (!b) return;
      prefs.aba = b.getAttribute('data-status'); estado.mostrar = 8; salvarPrefs(); renderDesafios(estado.dados, deriv);
    });
    $('#pfAbas').addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      var bs = $$('#pfAbas button'), i = bs.indexOf(doc.activeElement); if (i < 0) return;
      var n = bs[(i + (e.key === 'ArrowRight' ? 1 : bs.length - 1)) % bs.length]; n.focus(); n.click();
    });
    var t = null;
    $('#pfBusca').addEventListener('input', function (e) {
      win.clearTimeout(t); var val = e.target.value;
      t = win.setTimeout(function () { estado.busca = val; estado.mostrar = 8; renderDesafios(estado.dados, deriv); }, 160);
    });
    $('#pfOrigem').addEventListener('change', function (e) { estado.origem = e.target.value; estado.mostrar = 8; renderDesafios(estado.dados, deriv); });
    $('#pfDesafios').addEventListener('click', function (e) {
      if (!e.target.closest('#pfMais')) return;
      estado.mostrar += 8; renderDesafios(estado.dados, deriv);
    });
    $('#pfHabOrdem').addEventListener('change', function (e) { prefs.habOrdem = e.target.value; salvarPrefs(); renderHabilidades(estado.dados, deriv); });
    $('#pfHabilidades').addEventListener('click', function (e) {
      if (!e.target.closest('#pfHabTodas')) return;
      estado.habTodas = !estado.habTodas; renderHabilidades(estado.dados, deriv);
    });
    Object.keys(SECOES).forEach(function (id) {
      var cfg = SECOES[id];
      $('#' + id).addEventListener('click', function (e) {
        var cab = e.target.closest('.pf-nivel__cab');
        if (cab) {
          var chave = cab.parentNode.getAttribute('data-chave');
          prefs[cfg.pref] = prefs[cfg.pref] === chave ? '' : chave;
          estado[cfg.est] = { status: '', parte: '', mostrar: 6 };
          salvarPrefs(); renderSecao(id, estado.dados, itensDaSecao(id, estado.dados, deriv));
          var novo = $('#' + id + ' .pf-nivel[data-chave="' + chave + '"] .pf-nivel__cab'); if (novo) novo.focus();
          return;
        }
        var f = estado[cfg.est];
        var st = e.target.closest('[data-nv-status]'), pt = e.target.closest('[data-nv-parte]'), mais = e.target.closest('[data-nv-mais]');
        if (st) { f.status = st.getAttribute('data-nv-status'); f.mostrar = 6; }
        else if (pt) { var idp = pt.getAttribute('data-nv-parte'); f.parte = f.parte === idp ? '' : idp; f.mostrar = 6; }
        else if (mais) { f.mostrar += 6; }
        else return;
        var alvo = st ? '[data-nv-status="' + f.status + '"]' : pt ? '[data-nv-parte="' + pt.getAttribute('data-nv-parte') + '"]' : null;
        atualizarPainelAberto(id, estado.dados, deriv);
        if (alvo) { var b = $('#' + id + ' .is-aberto ' + alvo); if (b) b.focus(); }
      });
    });
    $('#pfEvModo').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-modo]'); if (!b) return;
      prefs.evModo = b.getAttribute('data-modo') || ''; salvarPrefs(); renderEventos(estado.dados);
    });
    $('#pfEventos').addEventListener('click', function (e) {
      if (!e.target.closest('#pfEvTodos')) return;
      estado.evTodos = !estado.evTodos; renderEventos(estado.dados);
    });
    $('#pfInsFiltro').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-ins]'); if (!b) return;
      prefs.ins = b.getAttribute('data-ins') || ''; salvarPrefs(); renderInsignias(estado.dados, deriv);
    });
    $('#pfInsignias').addEventListener('click', function (e) {
      var b = e.target.closest('[data-ins-id]'); if (b) abrirInsignia(b.getAttribute('data-ins-id'));
    });
    var dlg = $('#pfInsDlg');
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg) { fecharInsignia(); return; }            /* clique no fundo escurecido */
      var ir = e.target.closest('[data-ins-ir]');
      if (ir) { abrirInsignia(ir.getAttribute('data-ins-ir')); return; }
      if (e.target.closest('[data-ins-fechar]')) fecharInsignia();
    });
    dlg.addEventListener('cancel', function (e) { e.preventDefault(); fecharInsignia(); });
    dlg.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      if (e.target.closest && e.target.closest('a')) return;
      var btns = $$('[data-ins-ir]', dlg), b = btns[e.key === 'ArrowLeft' ? 0 : btns.length - 1];
      if (b) { e.preventDefault(); abrirInsignia(b.getAttribute('data-ins-ir')); }
    });
    $('#pfRankEscopo').addEventListener('change', function (e) { prefs.escopo = e.target.value; salvarPrefs(); renderRanking(estado.dados); });

    var larg = 0;
    win.addEventListener('resize', function () {
      var w = $('#pfGrafico').clientWidth;
      if (deriv && Math.abs(w - larg) > 24) { larg = w; renderGrafico(deriv); }
    });

    $('#sair').addEventListener('click', function () {
      fetch('/api/member/logout', { method: 'POST', credentials: 'same-origin' })
        .catch(function () {})
        .finally(function () { location.href = '/'; });
    });
  }

  function falhaGeral() {
    $('#pfApp').setAttribute('aria-busy', 'false');
    $('#pfHero').innerHTML = '<div class="pf-vazio" style="grid-column:1/-1">Não foi possível carregar o seu perfil agora. Verifique a conexão e recarregue a página.</div>';
  }

  function iniciar() {
    ligarEventos();
    fetch(API, { credentials: 'same-origin' })
      .then(function (r) {
        if (r.status === 401) { location.href = '/entrar/'; return 'saindo'; }
        return r.ok ? r.json() : null;
      })
      .then(function (d) {
        if (d === 'saindo') return;
        if (!d || !d.membro) { falhaGeral(); return; }
        estado.dados = d; renderTudo();
      })
      .catch(falhaGeral);
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})(window, document);
