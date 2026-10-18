/**
 * UP DANCE EXPERIENCE — TÍTULOS DE HABILIDADE E DE REPUTAÇÃO
 * /js/titulos.data.js  ·  catálogo de exibição (gerado; não editar à mão)
 * ----------------------------------------------------------------
 * Três famílias de títulos:
 *
 *  1. HABILIDADE POR MODALIDADE  (modalidades.*)
 *     5 modalidades × 4 níveis (Free → Técnico) × 6 categorias = 120 títulos.
 *     O nome muda a cada nível (descoberta → construção → domínio → maestria).
 *     Cada título tem 3 tiers (I Desperto · II Afinado · III Pleno).
 *     id: hab-<modalidade>-<free|ini|int|tec>-<categoria>
 *
 *  2. HABILIDADE TRANSVERSAL     (transversais)
 *     Títulos que cruzam estilos e valem para a Profissionalização
 *     (Bailarino(a), Performer, Improviso, Popping + Coreografia).
 *     Mantêm os ids trans-* já gravados no D1.
 *
 *  3. REPUTAÇÃO                  (reputacao)
 *     Reconhecimento pela comunidade e constância: rodas, condução,
 *     cultura, tempo de casa, ensino e pontos de reputação.
 *     Guardião do Estilo, Semeador da Essência e Inspirador de Símbolos
 *     vêm dos transversais antigos (idLegado) e continuam valendo para
 *     quem já os conquistou.
 *
 * A concessão é do servidor; este módulo só descreve e exibe.
 * nome = forma masculina · nomeF = forma feminina (iguais quando neutras).
 * Modalidades usam as mesmas chaves de reputacao.data.js (hhd, pop, lock, break, house).
 */
(function (global) {
  'use strict';

  var T = /*__DADOS__*/;

  var SIGLA = { fundamentos: 'free', iniciante: 'ini', intermediario: 'int', tecnico: 'tec' };
  var indice = {};
  Object.keys(T.modalidades).forEach(function (mid) {
    var m = T.modalidades[mid];
    m.categorias.forEach(function (c) {
      Object.keys(c.titulos).forEach(function (nv) {
        var t = c.titulos[nv];
        indice[t.id] = { familia: 'habilidade', modalidade: mid, nivel: nv, categoria: c.id, titulo: t };
      });
    });
  });
  T.reputacao.forEach(function (r) {
    indice[r.id] = { familia: 'reputacao', titulo: r };
    if (r.idLegado) indice[r.idLegado] = indice[r.id];
  });
  T.transversais.forEach(function (t) { indice[t.id] = { familia: 'transversal', titulo: t }; });
  T.indice = indice;

  /* id de um título de habilidade */
  T.idHabilidade = function (modalidade, nivel, categoria) {
    return 'hab-' + modalidade + '-' + (SIGLA[nivel] || nivel) + '-' + categoria;
  };

  /* Nome para exibir: genero 'f' usa a forma feminina; tier (1..3) acrescenta o numeral. */
  T.nomeTitulo = function (id, opc) {
    opc = opc || {};
    var x = indice[id];
    if (!x) return id;
    var nome = opc.genero === 'f' ? (x.titulo.nomeF || x.titulo.nome) : x.titulo.nome;
    if (opc.tier) nome += ' ' + (['I', 'II', 'III'][opc.tier - 1] || '');
    return nome;
  };

  /* Tier atingido numa categoria/nível a partir dos desafios.
     aprovados/total: contagem de desafios da categoria no nível; notaMax: maior nota
     de avaliação da modalidade (0–100). Retorna 0 quando ainda não há tier. */
  T.tierHabilidade = function (aprovados, total, notaMax) {
    if (!total || !aprovados) return 0;
    if (aprovados >= total && (notaMax || 0) >= 85) return 3;
    if (aprovados * 2 >= total) return 2;
    return 1;
  };

  global.UDX_TITULOS = T;
  if (typeof module !== 'undefined' && module.exports) module.exports = T;
}(typeof window !== 'undefined' ? window : this));
