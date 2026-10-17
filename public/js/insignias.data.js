/* ================================================================
   INSÍGNIAS — Up Dance Xperience · /js/insignias.data.js
   Catálogo das insígnias exibidas no perfil e na página de revisão.
   Imagens em /sprites/insignias/udx-insignia-<id>-<256|768>.webp

   regra.tipo
     'trilha'   → conquistada quando trilha_insignias tem regra.insignia
                  (o worker grava ao atingir o limiar de XPE do nível)
     'talentos' → conquistada com o primeiro título de uma Árvore de
                  Talentos da Profissionalização (talent_titulos)
     'evento'   → conquistada com a primeira presença confirmada em
                  evento da plataforma (evento_participacoes.situacao = 'presente')
================================================================ */
(function (win) {
  'use strict';
  var BASE = '/sprites/insignias/';

  var LISTA = [
    { id: 'free',          nome: 'Free',          titulo: 'Insígnia do Nível Free',
      cor: '#29A8F0', regra: { tipo: 'trilha', trilha: 'fundamentos',   insignia: 'fund-insignia' },
      como: 'Conclua a trilha do Nível Free somando os XPE de desafios aprovados até o limiar do nível.' },
    { id: 'iniciante',     nome: 'Iniciante',     titulo: 'Insígnia do Nível Iniciante',
      cor: '#8EDB1E', regra: { tipo: 'trilha', trilha: 'iniciante',     insignia: 'ini-insignia' },
      como: 'Conclua a trilha do Nível Iniciante somando os XPE de desafios aprovados até o limiar do nível.' },
    { id: 'intermediario', nome: 'Intermediário', titulo: 'Insígnia do Nível Intermediário',
      cor: '#B44BF0', regra: { tipo: 'trilha', trilha: 'intermediario', insignia: 'int-insignia' },
      como: 'Conclua a trilha do Nível Intermediário somando os XPE de desafios aprovados até o limiar do nível.' },
    { id: 'tecnico',       nome: 'Técnico',       titulo: 'Insígnia do Nível Técnico',
      cor: '#F29A1A', regra: { tipo: 'trilha', trilha: 'tecnico',       insignia: 'tec-insignia' },
      como: 'Conclua a trilha do Nível Técnico somando os XPE de desafios aprovados até o limiar do nível.' },
    { id: 'profissional',  nome: 'Profissional',  titulo: 'Insígnia Profissional',
      cor: '#E6B84A', regra: { tipo: 'talentos' },
      como: 'Conquiste o título de uma das Árvores de Talentos da Profissionalização (Bailarino(a), Professor(a) ou Performer). Área exclusiva de Estagiário(a).' },
    { id: 'participacao',  nome: 'Participação',  titulo: 'Insígnia de Participação',
      cor: '#D24BEA', regra: { tipo: 'evento' },
      como: 'Tenha presença confirmada em um evento promovido pela Up Dance, presencial ou on-line.' }
  ];

  LISTA.forEach(function (i) {
    i.img = BASE + 'udx-insignia-' + i.id + '-256.webp';
    i.imgGrande = BASE + 'udx-insignia-' + i.id + '-768.webp';
  });

  var indice = {}, porInsigniaTrilha = {};
  LISTA.forEach(function (i) {
    indice[i.id] = i;
    if (i.regra.insignia) porInsigniaTrilha[i.regra.insignia] = i;
  });

  win.UDX_INSIGNIAS = { lista: LISTA, indice: indice, porInsigniaTrilha: porInsigniaTrilha };
})(window);
