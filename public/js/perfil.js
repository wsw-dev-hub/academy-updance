/* ================================================================
   MEU PERFIL — Up Dance Experience
   /js/perfil.js  ·  página /membros/perfil/
   ----------------------------------------------------------------
   Lê GET /api/perfil/resumo (uma chamada) e monta o painel:
   ritmo diário, desafios, habilidades, eventos, experiência,
   ranking, títulos, reputação e atividade.
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
  var PAGINA_TALENTOS = '/membros/estagio/arvore-de-talentos/';

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

  /* Atividade: rótulo por tipo de evento registrado pelo worker. */
  var ATIVIDADE = {
    member_cadastro:          { txt: 'Criou a conta',                         cor: '#8F7CFF' },
    member_confirmado:        { txt: 'Confirmou o e-mail',                    cor: '#8F7CFF' },
    member_login:             { txt: 'Entrou na área de membros',             cor: 'rgba(223,224,242,.45)' },
    magic_login_ok:           { txt: 'Entrou por link de acesso',             cor: 'rgba(223,224,242,.45)' },
    reset_concluido:          { txt: 'Criou uma nova senha',                  cor: 'rgba(223,224,242,.45)' },
    trilha_desafio_pendente:  { txt: 'Enviou um desafio de trilha',           cor: '#8F7CFF', desafio: true },
    trilha_desafio_aprovado:  { txt: 'Desafio de trilha aprovado',            cor: '#FA33A1', desafio: true },
    trilha_desafio_recusado:  { txt: 'Desafio de trilha recusado',            cor: '#F27405', desafio: true },
    talento_desafio_pendente: { txt: 'Enviou um desafio da Árvore de Talentos', cor: '#8F7CFF', desafio: true },
    talento_desafio_aprovado: { txt: 'Desafio da Árvore de Talentos aprovado', cor: '#FA33A1', desafio: true },
    talento_desafio_recusado: { txt: 'Desafio da Árvore de Talentos recusado', cor: '#F27405', desafio: true },
    talento_plano_salvo:      { txt: 'Salvou um plano da Árvore de Talentos', cor: '#8F7CFF' },
    reputacao_reavaliar:      { txt: 'Nota de desempenho revisada',           cor: '#F2B807', desafio: true }
  };

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
      return 'Árvore de Talentos, ' + ((nomes.perfisTalento && nomes.perfisTalento[grupo]) || grupo);
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
  var prefs = { aba: 'pendente', dias: 14, meta: 3, habOrdem: 'progresso', escopo: 'geral' };
  try { var salvo = JSON.parse(win.localStorage.getItem(CHAVE_PREFS) || 'null'); if (salvo) for (var k in salvo) prefs[k] = salvo[k]; } catch (e) {}
  function salvarPrefs() { try { win.localStorage.setItem(CHAVE_PREFS, JSON.stringify(prefs)); } catch (e) {} }

  var estado = { dados: null, busca: '', origem: '', mostrar: 8, habTodas: false };

  /* ================================================================
     DERIVAÇÕES — tudo calculado a partir da resposta da API
  ================================================================ */
  function derivar(d) {
    var lista = (d.desafios || []).map(function (x) {
      return {
        origem: x.origem, id: x.id, grupo: x.grupo, xp: Number(x.xp) || 0, status: x.status,
        parecer: x.parecer || '', nome: x.nome || x.id, tipo: x.tipo || 'tarefa',
        hab: x.hab || '', habNome: x.hab_nome || '',
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
      if (estado.origem && x.origem !== estado.origem) return false;
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
     EVENTOS — desafios do tipo "evento"
  ================================================================ */
  function renderEventos(d, v) {
    var ev = v.lista.filter(function (x) { return x.tipo === 'evento' && x.status !== 'recusado'; });
    ev.sort(function (a, b) { return ((b.avaliado || b.enviado) || 0) - ((a.avaliado || a.enviado) || 0); });
    var ok = ev.filter(function (x) { return x.status === 'aprovado'; }).length;
    var caixa = $('#pfEventos');
    if (!ev.length) {
      caixa.innerHTML = '<div class="pf-vazio">Nenhuma participação registrada ainda. Quando um desafio do tipo evento for aprovado, ele entra aqui.</div>';
      return;
    }
    caixa.innerHTML =
      '<p class="pf-rank__dica"><b>' + plural(ok, 'participação confirmada', 'participações confirmadas') + '</b>' +
        (ev.length - ok ? ', ' + plural(ev.length - ok, 'aguardando validação', 'aguardando validação') : '') + '</p>' +
      '<ol class="pf-tempo">' + ev.slice(0, 8).map(function (x) {
        var dt = x.avaliado || x.enviado;
        return '<li style="--marca:' + (x.status === 'aprovado' ? 'var(--pf-alcancado)' : 'var(--pf-pendente)') + '">' +
          '<b style="color:#fff;font-weight:600">' + esc(x.nome) + '</b>' +
          '<small>' + esc(rotuloGrupo(x.origem, x.grupo, d.nomes || {})) + ', ' +
            (x.status === 'aprovado' ? 'confirmada ' : 'enviada ') + esc(quando(dt)) + ', +' + fmt(x.xp) + ' ' + unidadeXp(x.origem) + '</small>' +
        '</li>';
      }).join('') + '</ol>';
  }

  /* ================================================================
     EXPERIÊNCIA
  ================================================================ */
  function renderXp(d, v) {
    var cfg = (d.config && d.config.trilhas) || {};
    var insig = {}; ((d.titulos && d.titulos.insignias) || []).forEach(function (i) { insig[i.id] = true; });
    var tocadas = {}; v.lista.forEach(function (x) { tocadas[x.origem + '|' + x.grupo] = true; });
    var linhas = [];

    Object.keys(TRILHAS).forEach(function (id) {
      if (!tocadas['trilha|' + id] && !v.xpTrilha[id]) return;
      var lim = (cfg[id] && cfg[id].limiar) || 0, xp = v.xpTrilha[id] || 0;
      var pct = lim ? Math.min(100, (xp / lim) * 100) : 0;
      var ganhou = cfg[id] && insig[cfg[id].insignia];
      linhas.push('<div class="pf-linha">' +
        '<div class="pf-linha__topo"><a href="' + TRILHAS[id].pagina + '">' + esc(TRILHAS[id].rotulo) + '</a>' +
          '<span class="pf-linha__valor"><strong>' + fmt(xp) + '</strong> de ' + fmt(lim) + ' XPE' +
          (ganhou ? ' <span class="pf-selo"><span class="mdi mdi-medal" aria-hidden="true"></span>insígnia</span>' : '') + '</span></div>' +
        '<div class="pf-trilho" role="img" aria-label="' + Math.round(pct) + '% do XPE do nível"><i class="xp" style="width:' + pct.toFixed(1) + '%"></i></div>' +
        '<div class="pf-linha__nota">' + (pct >= 100 ? 'Nível concluído.' : 'Faltam ' + fmt(Math.max(0, lim - xp)) + ' XPE para concluir o nível.') + '</div>' +
      '</div>');
    });

    var porPonto = (d.config && d.config.xpPorPonto) || 100;
    Object.keys(v.xpTalento).forEach(function (p) {
      var xp = v.xpTalento[p], pontos = Math.floor(xp / porPonto);
      var resto = xp % porPonto;
      linhas.push('<div class="pf-linha">' +
        '<div class="pf-linha__topo"><a href="' + PAGINA_TALENTOS + '">' + esc(rotuloGrupo('talentos', p, d.nomes || {})) + '</a>' +
          '<span class="pf-linha__valor"><strong>' + fmt(xp) + '</strong> XP</span></div>' +
        '<div class="pf-trilho" role="img" aria-label="' + resto + ' de ' + porPonto + ' XP para o próximo ponto de talento"><i class="xp" style="width:' + ((resto / porPonto) * 100).toFixed(1) + '%"></i></div>' +
        '<div class="pf-linha__nota">' + plural(pontos, 'ponto de talento', 'pontos de talento') + '. Faltam ' + (porPonto - resto) + ' XP para o próximo.</div>' +
      '</div>');
    });

    $('#pfXp').innerHTML = linhas.length
      ? '<div class="pf-linhas">' + linhas.join('') + '</div>'
      : '<div class="pf-vazio">Sua experiência aparece aqui quando o primeiro desafio for aprovado. <a href="/membros/">Escolher uma trilha</a></div>';
  }

  /* ================================================================
     RANKING
  ================================================================ */
  function rotuloEscopo(id, d) {
    if (id === 'geral') return 'Geral';
    if (id === 'talentos') return 'Árvore de Talentos';
    return (TRILHAS[id] && TRILHAS[id].rotulo) || (d.nomes && d.nomes.niveis && d.nomes.niveis[id]) || id;
  }
  function renderRanking(d) {
    var rk = d.ranking, caixa = $('#pfRanking'), sel = $('#pfRankEscopo');
    if (!rk) { caixa.innerHTML = '<div class="pf-vazio">O ranking não pôde ser carregado agora.</div>'; sel.hidden = true; return; }
    var ids = ['geral'].concat(Object.keys(TRILHAS).filter(function (k) { return rk[k]; }), rk.talentos ? ['talentos'] : []);
    if (ids.indexOf(prefs.escopo) === -1) prefs.escopo = 'geral';
    sel.innerHTML = ids.map(function (id) { return '<option value="' + id + '"' + (id === prefs.escopo ? ' selected' : '') + '>' + esc(rotuloEscopo(id, d)) + '</option>'; }).join('');
    sel.hidden = ids.length < 2;

    var r = rk[prefs.escopo] || { participantes: 0, xp: 0, pos: null, faltam: 0, top: [] };
    var un = prefs.escopo === 'talentos' ? 'XP' : prefs.escopo === 'geral' ? 'XP' : 'XPE';
    var lider = (r.top[0] && r.top[0].xp) || 1;
    var html = '';
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
    (t.insignias || []).forEach(function (i) {
      var meta = INSIGNIAS[i.id] || { nome: i.id, icone: 'mdi-medal-outline' };
      var em = data(i.em);
      cards.push(card(meta.icone, meta.nome, ((TRILHAS[i.grupo] && TRILHAS[i.grupo].rotulo) || i.grupo) + (em ? ', ' + diaCurto(em) + ' de ' + em.getFullYear() : ''), null));
    });
    var T = win.UDX_TALENTOS, idx = (T && T.indice) || {};
    (t.talentos || []).forEach(function (x) {
      var n = idx[x.id] || {};
      cards.push(card(n.icone || 'mdi-crown-outline', n.nome || x.id, rotuloGrupo('talentos', x.grupo, d.nomes || {}), null));
    });
    ((d.reputacao && d.reputacao.titulos) || []).forEach(function (x) {
      var r = nomeTituloRep(x.titulo_id);
      var escopo = win.UDX_REP && win.UDX_REP.perfilLabel ? win.UDX_REP.perfilLabel(x.escopo) : x.escopo;
      cards.push(card((r && r.icone) || 'mdi-shield-star-outline', (r && r.nome) || x.titulo_id,
        'Reputação' + (escopo && escopo !== 'Geral' ? ', ' + escopo : ''), r && r.cor));
    });
    $('#pfTitulos').innerHTML = cards.length
      ? '<div class="pf-titulos">' + cards.join('') + '</div>'
      : '<div class="pf-vazio">Nenhum título ainda. Insígnias chegam ao concluir um nível; títulos, pela Árvore de Talentos e pelas avaliações de desempenho.</div>';

    function card(ic, nome, origem, cor) {
      return '<div class="pf-titulo"' + (cor ? ' style="--tit-cor:' + esc(cor) + '"' : '') + '>' +
        '<span class="pf-titulo__ico"><span class="mdi ' + esc(ic) + '" aria-hidden="true"></span></span>' +
        '<b>' + esc(nome) + '</b><span>' + esc(origem) + '</span></div>';
    }
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
     ATIVIDADE RECENTE
  ================================================================ */
  function renderAtividade(d, v) {
    var nomes = {}; v.lista.forEach(function (x) { nomes[x.id] = x.nome; });
    var itens = (d.atividade || []).filter(function (a) { return ATIVIDADE[a.tipo]; }).slice(0, 12);
    $('#pfAtividade').innerHTML = itens.length
      ? '<ol class="pf-tempo">' + itens.map(function (a) {
          var m = ATIVIDADE[a.tipo], extra = m.desafio && a.ref && nomes[a.ref] ? ': ' + nomes[a.ref] : '';
          return '<li style="--marca:' + m.cor + '">' + esc(m.txt + extra) + '<small>' + esc(quando(data(a.em))) + '</small></li>';
        }).join('') + '</ol>'
      : '<div class="pf-vazio">Sem atividade registrada ainda.</div>';
  }

  /* ================================================================
     MONTAGEM, EVENTOS E CARGA
  ================================================================ */
  var deriv = null;
  function renderTudo() {
    var d = estado.dados; deriv = derivar(d);
    renderHero(d, deriv); renderHoje(deriv); renderGrafico(deriv);
    renderDesafios(d, deriv); renderHabilidades(d, deriv); renderEventos(d, deriv);
    renderXp(d, deriv); renderRanking(d); renderTitulos(d); renderReputacao(d); renderAtividade(d, deriv);
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
