/* ================================================================
   SPRITES 2D — Up Dance Experience · /js/sprites.js
   Pausa a animação dos .udx-sprite e o brilho das .udx-insignia fora
   da tela (economiza bateria)
   e expõe UDX_SPRITE.criar(meta, { largura }) para montar um sprite
   a partir do JSON de /sprites/*.json.
================================================================ */
(function (win, doc) {
  'use strict';
  var io = 'IntersectionObserver' in win ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { e.target.classList.toggle('is-pausado', !e.isIntersecting); });
  }, { rootMargin: '80px' }) : null;

  function observar(raiz) {
    if (!io) return;
    Array.prototype.forEach.call((raiz || doc).querySelectorAll('.udx-sprite:not([data-obs]), .udx-insignia:not([data-obs])'), function (el) {
      el.setAttribute('data-obs', ''); io.observe(el);
    });
  }

  /* meta: { arquivo, quadro:{largura,altura}, quadros, fps, nome } */
  function criar(meta, opc) {
    opc = opc || {};
    var base = opc.base || '/sprites/';
    var w = opc.largura || Math.round(meta.quadro.largura / 2);
    var h = Math.round(w * meta.quadro.altura / meta.quadro.largura);
    var el = doc.createElement('span');
    el.className = 'udx-sprite' + (meta.loop === false ? ' is-uma-vez' : '');
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', meta.nome || '');
    el.style.setProperty('--src', 'url("' + base + meta.arquivo + '")');
    el.style.setProperty('--n', meta.quadros);
    el.style.setProperty('--fps', meta.fps || 12);
    el.style.setProperty('--w', w + 'px');
    el.style.setProperty('--h', h + 'px');
    if (io) { el.setAttribute('data-obs', ''); io.observe(el); }
    return el;
  }

  win.UDX_SPRITE = { criar: criar, observar: observar };
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', function () { observar(); });
  else observar();
})(window, document);
