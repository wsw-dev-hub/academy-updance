# Gera public/js/titulos.data.js a partir deste catálogo (fonte única).
import json, re, sys, collections

NIVEIS = [
    ('fundamentos',   'Free',          'Descoberta: primeiro contato com o vocabulário.'),
    ('iniciante',     'Iniciante',     'Construção: repetir com controle e ligar movimentos.'),
    ('intermediario', 'Intermediário', 'Domínio: variar, combinar e aplicar em música e roda.'),
    ('tecnico',       'Técnico',       'Maestria: assinatura própria, precisão e repertório amplo.'),
]
NV = [n[0] for n in NIVEIS]

# Sugestões enviadas (32), na ordem da tabela.
SUGESTOES = [
    'Artífice do Ritmo', 'Navegador do Bounce', 'Tecelão do Groove', 'Mensageiro do Flow Ancestral',
    'Arquiteto do Flow', 'Semeador do Bounce Infinito', 'Guardião do Estilo', 'Explorador do Espaço Negativo',
    'Explorador do Feeling', 'Forjador de Legados no Asfalto', 'Mestre do Flava', 'Guardião do Cipher',
    'Intérprete da Jornada', 'Portador da Chama do Hip-Hop', 'Condutor da Liberdade Criativa', 'Escultor de Atmosferas',
    'Alquimista da Precisão', 'Alfaiate de Histórias no Chão', 'Inspirador de Símbolos', 'Portador do Tutting Ancestral',
    'Forjador do Movimento', 'Engenheiro da Isolação', 'Pilar da Presença', 'Andarilho do Bounce Infinito',
    'Semeador da Essência', 'Portador do Lock Místico', 'Restaurador das Ondas Invisíveis', 'Guia do Toprock Lendário',
    'Mago do Swing Suave', 'Herói do Step Preciso', 'Navegador das Transições Geométricas', 'Amante dos Hits Eternos',
]

# modalidade -> (nome, ícone, cor, corAlt, [categorias])
# categoria = (id, nome, descrição, [ (nome, nomeF) por nível F/I/M/T ])
T = lambda m, f=None: (m, f or m)
MOD = collections.OrderedDict()

MOD['pop'] = ('Popping', 'mdi-flash', '#110273', '#430ABF', [
  ('hit', 'Hit / Pop', 'Contração e soltura no tempo: o "pop" que marca a batida no corpo.', [
     T('Descobridor do Primeiro Hit', 'Descobridora do Primeiro Hit'),
     T('Amante dos Hits Eternos'),
     T('Ferreiro do Contratempo', 'Ferreira do Contratempo'),
     T('Alquimista da Precisão')]),
  ('isolacao', 'Isolação', 'Mover uma parte do corpo mantendo o resto imóvel.', [
     T('Aprendiz das Partes Soltas'),
     T('Lapidador dos Eixos Isolados', 'Lapidadora dos Eixos Isolados'),
     T('Engenheiro da Isolação', 'Engenheira da Isolação'),
     T('Mestre das Mil Engrenagens', 'Mestra das Mil Engrenagens')]),
  ('waving', 'Waving', 'Ondas que atravessam braços e tronco sem quebrar a linha.', [
     T('Explorador das Primeiras Ondas', 'Exploradora das Primeiras Ondas'),
     T('Navegador da Correnteza', 'Navegadora da Correnteza'),
     T('Restaurador das Ondas Invisíveis', 'Restauradora das Ondas Invisíveis'),
     T('Soberano das Marés Contínuas', 'Soberana das Marés Contínuas')]),
  ('tutting', 'Tutting', 'Ângulos retos, caixas e figuras geométricas com braços e mãos.', [
     T('Riscador dos Ângulos Retos', 'Riscadora dos Ângulos Retos'),
     T('Construtor de Caixas no Ar', 'Construtora de Caixas no Ar'),
     T('Navegador das Transições Geométricas', 'Navegadora das Transições Geométricas'),
     T('Portador do Tutting Ancestral', 'Portadora do Tutting Ancestral')]),
  ('animation', 'Animation', 'Robot, strobing, ticking e dime stops: o corpo em quadros.', [
     T('Curioso do Corpo Robótico', 'Curiosa do Corpo Robótico'),
     T('Domador do Strobe', 'Domadora do Strobe'),
     T('Escultor do Robot', 'Escultora do Robot'),
     T('Mago do Tempo Congelado', 'Maga do Tempo Congelado')]),
  ('musicalidade', 'Musicalidade', 'Ouvir camadas do funk e escolher o que marcar no corpo.', [
     T('Ouvinte do Grave'),
     T('Caçador de Batidas Escondidas', 'Caçadora de Batidas Escondidas'),
     T('Narrador do Funk em Movimento', 'Narradora do Funk em Movimento'),
     T('Oráculo das Camadas Sonoras')]),
])

MOD['lock'] = ('Locking', 'mdi-lock', '#F2B807', '#8C0783', [
  ('locks', 'Locks & Points', 'A trava (lock) e os apontamentos (points) que dão nome ao estilo.', [
     T('Aprendiz do Primeiro Lock'),
     T('Apontador das Verdades', 'Apontadora das Verdades'),
     T('Portador do Lock Místico', 'Portadora do Lock Místico'),
     T('Herdeiro do Campbellock', 'Herdeira do Campbellock')]),
  ('footwork', 'Footwork', 'Stop and go, scooby doo, skeeter rabbit e o trabalho de pernas.', [
     T('Andarilho do Stop and Go', 'Andarilha do Stop and Go'),
     T('Corredor das Pernas Alegres', 'Corredora das Pernas Alegres'),
     T('Saltador do Skeeter Rabbit', 'Saltadora do Skeeter Rabbit'),
     T('Lenda dos Pés Ligeiros')]),
  ('bracos', 'Giros & Wrist Rolls', 'Twirls, wrist rolls e a leveza dos braços e punhos.', [
     T('Curioso dos Pulsos Soltos', 'Curiosa dos Pulsos Soltos'),
     T('Lapidador dos Giros de Pulso', 'Lapidadora dos Giros de Pulso'),
     T('Tecelão dos Twirls', 'Tecelã dos Twirls'),
     T('Mago dos Punhos Dourados', 'Maga dos Punhos Dourados')]),
  ('drops', 'Drops & Acrobacias', 'Knee drops, splits e saltos: a queda que vira efeito.', [
     T('Desbravador do Primeiro Drop', 'Desbravadora do Primeiro Drop'),
     T('Domador do Knee Drop', 'Domadora do Knee Drop'),
     T('Acrobata do Split Relâmpago'),
     T('Soberano da Queda Perfeita', 'Soberana da Queda Perfeita')]),
  ('musicalidade', 'Musicalidade', 'Funk e soul dos anos 70: tempos, pausas e acentos.', [
     T('Ouvinte do Funk'),
     T('Contador de Tempos Quebrados', 'Contadora de Tempos Quebrados'),
     T('Artífice do Ritmo'),
     T('Maestro do Groove Setentista', 'Maestrina do Groove Setentista')]),
  ('flava', 'Flava & Showmanship', 'Personalidade, humor e interação com a plateia.', [
     T('Dono do Sorriso na Roda', 'Dona do Sorriso na Roda'),
     T('Animador da Roda', 'Animadora da Roda'),
     T('Palhaço Real da Roda', 'Palhaça Real da Roda'),
     T('Mestre do Flava', 'Mestra do Flava')]),
])

MOD['break'] = ('Breaking', 'mdi-rotate-360', '#5C4A3F', '#A08672', [
  ('toprock', 'Toprock & Up Rock', 'A dança em pé que abre a entrada e conversa com o oponente.', [
     T('Calouro do Toprock', 'Caloura do Toprock'),
     T('Andarilho do Indian Step', 'Andarilha do Indian Step'),
     T('Artesão do Toprock Afiado', 'Artesã do Toprock Afiado'),
     T('Guia do Toprock Lendário')]),
  ('godowns', 'Go-Downs & Transições', 'O caminho do pé ao chão e de volta, sem perder o tempo.', [
     T('Explorador do Caminho ao Chão', 'Exploradora do Caminho ao Chão'),
     T('Navegador dos Go-Downs', 'Navegadora dos Go-Downs'),
     T('Arquiteto das Descidas', 'Arquiteta das Descidas'),
     T('Mestre das Passagens Invisíveis', 'Mestra das Passagens Invisíveis')]),
  ('footwork', 'Footwork', 'Six-step, three-step, CCs e variações no chão.', [
     T('Aprendiz do Six-Step'),
     T('Tecelão dos Passos no Chão', 'Tecelã dos Passos no Chão'),
     T('Alfaiate de Histórias no Chão'),
     T('Soberano do Círculo Infinito', 'Soberana do Círculo Infinito')]),
  ('freezes', 'Freezes', 'Congelar o corpo em equilíbrio: baby freeze, chair, airbaby.', [
     T('Curioso do Corpo Suspenso', 'Curiosa do Corpo Suspenso'),
     T('Explorador do Espaço Negativo', 'Exploradora do Espaço Negativo'),
     T('Contador de Segundos Suspensos', 'Contadora de Segundos Suspensos'),
     T('Escultor do Tempo Parado', 'Escultora do Tempo Parado')]),
  ('power', 'Power Moves', 'Giros contínuos: backspin, windmill, swipe, flare.', [
     T('Desbravador do Primeiro Giro', 'Desbravadora do Primeiro Giro'),
     T('Caçador do Impulso', 'Caçadora do Impulso'),
     T('Domador do Eixo Invertido', 'Domadora do Eixo Invertido'),
     T('Furacão do Eixo Infinito')]),
  ('batalha', 'Musicalidade & Batalha', 'Break beat, estrutura de round, resposta e estratégia.', [
     T('Ouvinte do Break Beat'),
     T('Leitor do Break Beat', 'Leitora do Break Beat'),
     T('Estrategista da Roda'),
     T('Mestre do Round Decisivo', 'Mestra do Round Decisivo')]),
])

MOD['hhd'] = ('Hip Hop Dance', 'mdi-run', '#F27405', '#FA33A1', [
  ('bounce', 'Bounce & Rock', 'Os grooves de base: bounce, rock e o peso que não para.', [
     T('Descobridor do Bounce', 'Descobridora do Bounce'),
     T('Navegador do Bounce', 'Navegadora do Bounce'),
     T('Andarilho do Bounce Infinito', 'Andarilha do Bounce Infinito'),
     T('Semeador do Bounce Infinito', 'Semeadora do Bounce Infinito')]),
  ('steps', 'Steps & Footwork', 'Passos de deslocamento, cruzados e trabalho de pés.', [
     T('Caminhante dos Primeiros Passos'),
     T('Herói do Step Preciso', 'Heroína do Step Preciso'),
     T('Arquiteto dos Passos Cruzados', 'Arquiteta dos Passos Cruzados'),
     T('Mestre do Chão em Festa', 'Mestra do Chão em Festa')]),
  ('party', 'Party Dances', 'Running man, roger rabbit, kick step e o repertório das festas.', [
     T('Convidado da Primeira Festa', 'Convidada da Primeira Festa'),
     T('Colecionador de Party Dances', 'Colecionadora de Party Dances'),
     T('Anfitrião do Block Party', 'Anfitriã do Block Party'),
     T('Lenda do Old School')]),
  ('texturas', 'Texturas & Dinâmicas', 'Qualidade do movimento: duro, solto, lento, explosivo.', [
     T('Curioso das Texturas', 'Curiosa das Texturas'),
     T('Lapidador de Dinâmicas', 'Lapidadora de Dinâmicas'),
     T('Tecelão do Groove', 'Tecelã do Groove'),
     T('Alquimista dos Contrastes')]),
  ('musicalidade', 'Musicalidade', 'Boom bap, rap e camadas do beat traduzidas no corpo.', [
     T('Ouvinte do Boom Bap'),
     T('Marcador da Batida Seca', 'Marcadora da Batida Seca'),
     T('Decifrador do Beat', 'Decifradora do Beat'),
     T('Regente do Beat Vivo')]),
  ('freestyle', 'Freestyle & Coreografia', 'Improvisar e compor: da primeira roda à coreografia autoral.', [
     T('Desbravador do Primeiro Freestyle', 'Desbravadora do Primeiro Freestyle'),
     T('Construtor de Sequências', 'Construtora de Sequências'),
     T('Autor de Coreografias Vivas', 'Autora de Coreografias Vivas'),
     T('Visionário da Cena', 'Visionária da Cena')]),
])

MOD['house'] = ('House Dance', 'mdi-home-heart', '#030BA6', '#FA33A1', [
  ('jacking', 'Jacking', 'A pulsação do tronco que sustenta toda a dança.', [
     T('Aprendiz do Primeiro Jack'),
     T('Batedor do Jack Contínuo', 'Batedora do Jack Contínuo'),
     T('Emissário do Sacred Groove', 'Emissária do Sacred Groove'),
     T('Coração do Jack Eterno')]),
  ('footwork', 'Footwork', 'Shuffles, heel-toe, skates e loose legs.', [
     T('Explorador dos Pés Leves', 'Exploradora dos Pés Leves'),
     T('Cartógrafo dos Pés Falantes', 'Cartógrafa dos Pés Falantes'),
     T('Artesão do Shuffle', 'Artesã do Shuffle'),
     T('Mestre do Chão Flutuante', 'Mestra do Chão Flutuante')]),
  ('lofting', 'Lofting & Chão', 'Descer, rolar e voltar ao pé no fluxo da música.', [
     T('Curioso do Chão', 'Curiosa do Chão'),
     T('Domador da Queda Livre', 'Domadora da Queda Livre'),
     T('Planador do Lofting', 'Planadora do Lofting'),
     T('Senhor do Voo Rasante', 'Senhora do Voo Rasante')]),
  ('swing', 'Swing & Fluidez', 'Balanço, ondulação e transferências sem quebra.', [
     T('Brincante do Balanço'),
     T('Viajante do Swing'),
     T('Guia do Círculo Contínuo'),
     T('Mago do Swing Suave', 'Maga do Swing Suave')]),
  ('feeling', 'Musicalidade & Feeling', 'Four-on-the-floor, vocais e a emoção da faixa.', [
     T('Ouvinte do Four-on-the-Floor'),
     T('Explorador do Feeling', 'Exploradora do Feeling'),
     T('Tradutor do Deep House', 'Tradutora do Deep House'),
     T('Alma do Groove Profundo')]),
  ('freestyle', 'Freestyle & Roda', 'Improviso no círculo: escutar, responder e criar na hora.', [
     T('Recém-chegado ao Círculo', 'Recém-chegada ao Círculo'),
     T('Improvisador do Círculo', 'Improvisadora do Círculo'),
     T('Poeta do Freestyle'),
     T('Espírito Livre da Pista')]),
])

# Onde as trilhas atuais já têm desafios do estilo (levantado dos *.data.js).
COBERTURA = {
  'pop':   {'fundamentos': True,  'iniciante': True,  'intermediario': True,  'tecnico': False},
  'hhd':   {'fundamentos': True,  'iniciante': True,  'intermediario': True,  'tecnico': False},
  'break': {'fundamentos': False, 'iniciante': True,  'intermediario': True,  'tecnico': True},
  'lock':  {'fundamentos': False, 'iniciante': False, 'intermediario': True,  'tecnico': False},
  'house': {'fundamentos': False, 'iniciante': False, 'intermediario': False, 'tecnico': True},
}
COBERTURA_NOTA = {
  'pop':   'Free (Vocabulário Popping), Iniciante (Básicos · Popping) e Intermediário (Groove, Improviso e História do Popping).',
  'hhd':   'Free (Vocabulário Hip Hop), Iniciante (Básicos · HipHop) e Intermediário (Groove, Improviso e História do Hip Hop Dance).',
  'break': 'Iniciante (Básicos · Top Rock), Intermediário (Top Rock, Groove e Improviso Breaking) e Técnico (Up Rock).',
  'lock':  'Intermediário (História, vocabulário e coreografia de Locking).',
  'house': 'Técnico (House Dance I e II).',
}

TIERS = [
  {'n': 1, 'rotulo': 'I',   'nome': 'Desperto', 'regra': 'Primeiro desafio aprovado da categoria neste nível.'},
  {'n': 2, 'rotulo': 'II',  'nome': 'Afinado',  'regra': 'Metade dos desafios da categoria aprovados neste nível.'},
  {'n': 3, 'rotulo': 'III', 'nome': 'Pleno',    'regra': 'Todos os desafios da categoria aprovados neste nível e uma avaliação da modalidade com nota 85 ou mais.'},
]

REPUTACAO = [
  {'id': 'rep-guardiao-cipher', 'nome': 'Guardião do Cipher', 'nomeF': 'Guardiã do Cipher', 'icone': 'mdi-account-group', 'cor': '#5C4A3F',
   'desc': 'Está sempre na roda: chega, assiste, entra e faz o cypher acontecer.',
   'tiers': ['3 presenças em rodas, cyphers ou battles', '10 presenças', '25 presenças'],
   'fonte': 'evento_participacoes (situacao = presente; tipo roda, cypher ou battle)', 'dados': 'disponivel'},
  {'id': 'rep-condutor-liberdade', 'nome': 'Condutor da Liberdade Criativa', 'nomeF': 'Condutora da Liberdade Criativa', 'icone': 'mdi-microphone-variant', 'cor': '#030BA6',
   'desc': 'Abre espaço para os outros criarem: conduz rodas, jams e sessões livres.',
   'tiers': ['Conduziu 1 roda, jam ou sessão (papel de condução no evento)', '5 conduções', '15 conduções'],
   'fonte': 'evento_participacoes.papel (condutor, host, jurado, DJ)', 'dados': 'disponivel'},
  {'id': 'rep-chama-hiphop', 'nome': 'Portador da Chama do Hip-Hop', 'nomeF': 'Portadora da Chama do Hip-Hop', 'icone': 'mdi-fire', 'cor': '#F27405',
   'desc': 'Conhece e carrega a cultura: história, valores e os cinco elementos.',
   'tiers': ['Concluiu "A Cultura Hip Hop" no Intermediário', '+ 5 presenças em eventos culturais', '+ 12 presenças em eventos culturais'],
   'fonte': 'trilha_progresso (nó i2 de cultura) + evento_participacoes', 'dados': 'disponivel'},
  {'id': 'rep-legados-asfalto', 'nome': 'Forjador de Legados no Asfalto', 'nomeF': 'Forjadora de Legados no Asfalto', 'icone': 'mdi-road-variant', 'cor': '#BF0449',
   'desc': 'Constância de quem constrói a própria história mês a mês.',
   'tiers': ['6 meses diferentes com desafio aprovado', '12 meses', '24 meses'],
   'fonte': 'trilha_progresso e talent_progresso (reviewed_at, status aprovado)', 'dados': 'disponivel'},
  {'id': 'rep-guardiao-estilo', 'idLegado': 'trans-guardiao', 'nome': 'Guardião do Estilo', 'nomeF': 'Guardiã do Estilo', 'icone': 'mdi-shield-crown', 'cor': '#F2B807', 'porEstilo': True,
   'desc': 'Protege a assinatura pessoal num estilo: aqui o estilo não se copia, se herda. Pode ser conquistado em cada modalidade.',
   'tiers': ['Marco 3 de desempenho no estilo (média 72, 10 avaliações)', 'Marco 5 (média 86, 20 avaliações)', 'Marco 7 (média 95, 40 avaliações)'],
   'fonte': 'escalaEstilo de reputacao.data.js (avaliações por estilo)', 'dados': 'disponivel'},
  {'id': 'rep-mensageiro-flow', 'nome': 'Mensageiro do Flow Ancestral', 'nomeF': 'Mensageira do Flow Ancestral', 'icone': 'mdi-account-voice', 'cor': '#8C0783',
   'desc': 'Leva adiante o que aprendeu: apoia aulas e passa o vocabulário para quem chega.',
   'tiers': ['5 aulas apoiadas como Monitor(a) ou Assistente', '20 aulas', '50 aulas'],
   'fonte': 'registro de aulas apoiadas (ainda não existe no D1)', 'dados': 'pendente'},
  {'id': 'rep-semeador-essencia', 'idLegado': 'trans-semeador', 'nome': 'Semeador da Essência', 'nomeF': 'Semeadora da Essência', 'icone': 'mdi-sprout', 'cor': '#8C0783',
   'desc': 'Planta em cada aula aquilo que germina em outros corpos muito depois.',
   'tiers': ['Título Professor(a) Certificado(a) na Árvore de Talentos', '3 alunos(as) orientados(as) promovidos(as) de nível', '10 alunos(as) promovidos(as)'],
   'fonte': 'talent_titulos (prof-titulo); orientação de alunos ainda não existe no D1', 'dados': 'parcial'},
  {'id': 'rep-inspirador-simbolos', 'idLegado': 'trans-inspirador', 'nome': 'Inspirador de Símbolos', 'nomeF': 'Inspiradora de Símbolos', 'icone': 'mdi-star-shooting', 'cor': '#5708A6',
   'desc': 'Seu gesto vira referência: o que você faz hoje é vocabulário de outros amanhã.',
   'tiers': ['1.500 pontos de reputação', '4.000 pontos', '8.000 pontos'],
   'fonte': 'pontos de reputação (os mesmos limiares de Referência, Autoridade e Lenda)', 'dados': 'disponivel'},
]

TRANSVERSAIS = [
  {'id': 'trans-forjador',   'nome': 'Forjador do Movimento',  'nomeF': 'Forjadora do Movimento',  'escopo': 'Bailarino(a)', 'icone': 'mdi-hammer', 'cor': '#F27405',
   'desc': 'Não executa passos, os funde: cada dinâmica sai com peso, brilho e propósito.', 'habilidade': 'avaliações de bailarino(a)'},
  {'id': 'trans-pilar',      'nome': 'Pilar da Presença',      'nomeF': 'Pilar da Presença',       'escopo': 'Performer', 'icone': 'mdi-pillar', 'cor': '#FA33A1',
   'desc': 'Ocupa o espaço antes mesmo de se mover.', 'habilidade': 'avaliações de performer'},
  {'id': 'trans-escultor',   'nome': 'Escultor de Atmosferas', 'nomeF': 'Escultora de Atmosferas', 'escopo': 'Performer (solo)', 'icone': 'mdi-weather-hazy', 'cor': '#FA33A1',
   'desc': 'Muda o clima do ambiente: a plateia esquece de piscar.', 'habilidade': 'avaliações de solo do performer'},
  {'id': 'trans-interprete', 'nome': 'Intérprete da Jornada',  'nomeF': 'Intérprete da Jornada',   'escopo': 'Improviso', 'icone': 'mdi-shuffle-variant', 'cor': '#F27405',
   'desc': 'Traduz em movimento o que a palavra não alcança.', 'habilidade': 'avaliações de improviso'},
  {'id': 'trans-arquiteto',  'nome': 'Arquiteto do Flow',      'nomeF': 'Arquiteta do Flow',       'escopo': 'Popping + Coreografia', 'icone': 'mdi-vector-polyline', 'cor': '#430ABF',
   'desc': 'Projeta rotas invisíveis por onde o movimento corre sem esbarrar em si mesmo.', 'habilidade': 'avaliações de popping e de coreografia'},
  {'id': 'trans-cadencias', 'nome': 'Mestre das Cadências', 'nomeF': 'Mestra das Cadências', 'escopo': 'Bailarino(a) · 5 linguagens', 'icone': 'mdi-metronome', 'cor': '#F20505', 'multiestilo': True, 'perfil': 'bailarino', 'habilidadeArvore': 'bal-multi',
   'desc': 'Domínio técnico de verdade em linguagens diferentes: cada estilo com a sua cadência.', 'tiersTexto': ['2 linguagens diferentes com nota acima de 80 em "Solo técnico"', '3 linguagens diferentes com nota acima de 85 em "Solo técnico"', '5 linguagens diferentes com nota acima de 90 em "Solo técnico"']},
  {'id': 'trans-linguagens', 'nome': 'Oráculo das Linguagens', 'nomeF': 'Oráculo das Linguagens', 'escopo': 'Bailarino(a) · 5 linguagens', 'icone': 'mdi-eye-circle-outline', 'cor': '#F20505', 'multiestilo': True, 'perfil': 'bailarino', 'habilidadeArvore': 'bal-multi',
   'desc': 'Funde linguagens numa mesma coreografia sem apagar a assinatura de nenhuma delas.', 'tiersTexto': ['2 linguagens diferentes com nota acima de 80 em "Coreografia de fusão"', '3 linguagens diferentes com nota acima de 85 em "Coreografia de fusão"', '5 linguagens diferentes com nota acima de 90 em "Coreografia de fusão"']},
  {'id': 'trans-nomade', 'nome': 'Nômade do Groove', 'nomeF': 'Nômade do Groove', 'escopo': 'Performer · 5 linguagens', 'icone': 'mdi-compass-rose', 'cor': '#FA33A1', 'multiestilo': True, 'perfil': 'performer', 'habilidadeArvore': 'perf-multi',
   'desc': 'Atravessa estilos no freestyle: a música muda e o corpo responde na língua certa.', 'tiersTexto': ['2 linguagens diferentes com nota acima de 80 em "Round de freestyle"', '3 linguagens diferentes com nota acima de 85 em "Round de freestyle"', '5 linguagens diferentes com nota acima de 90 em "Round de freestyle"']},
  {'id': 'trans-regente', 'nome': 'Regente do Movimento', 'nomeF': 'Regente do Movimento', 'escopo': 'Performer · 5 linguagens', 'icone': 'mdi-movie-open-star-outline', 'cor': '#FA33A1', 'multiestilo': True, 'perfil': 'performer', 'habilidadeArvore': 'perf-multi',
   'desc': 'Concebe e dirige números em que cada trecho fala uma linguagem diferente.', 'tiersTexto': ['2 linguagens diferentes com nota acima de 80 em "Número multiestilo"', '3 linguagens diferentes com nota acima de 85 em "Número multiestilo"', '5 linguagens diferentes com nota acima de 90 em "Número multiestilo"']},
  {'id': 'trans-dialetos', 'nome': 'Guardião dos Dialetos Urbanos', 'nomeF': 'Guardiã dos Dialetos Urbanos', 'escopo': 'Professor(a) · 5 linguagens', 'icone': 'mdi-translate', 'cor': '#5708A6', 'multiestilo': True, 'perfil': 'professor', 'habilidadeArvore': 'prof-multi',
   'desc': 'Ensina cada linguagem com a mesma segurança, do vocabulário à musicalidade.', 'tiersTexto': ['2 linguagens diferentes com nota acima de 80 em "Aula"', '3 linguagens diferentes com nota acima de 85 em "Aula"', '5 linguagens diferentes com nota acima de 90 em "Aula"']},
  {'id': 'trans-cronista', 'nome': 'Cronista das Cinco Escolas', 'nomeF': 'Cronista das Cinco Escolas', 'escopo': 'Professor(a) · 5 linguagens', 'icone': 'mdi-book-open-page-variant-outline', 'cor': '#5708A6', 'multiestilo': True, 'perfil': 'professor', 'habilidadeArvore': 'prof-multi',
   'desc': 'Conhece e conta a origem, os pioneiros e os fundamentos das cinco escolas.', 'tiersTexto': ['2 linguagens diferentes com nota acima de 80 em "Seminário de raízes"', '3 linguagens diferentes com nota acima de 85 em "Seminário de raízes"', '5 linguagens diferentes com nota acima de 90 em "Seminário de raízes"']},
]
TIERS_TRANS = ['3 avaliações seguidas com nota acima de 80', '3 avaliações seguidas acima de 85', '3 avaliações seguidas acima de 90 (critério atual do título)']

# ---------------------------------------------------------------- montagem
def norm(s): return re.sub(r'\s+', ' ', s).strip().lower()
sug_norm = {norm(s): s for s in SUGESTOES}

modalidades = collections.OrderedDict()
destino = {}   # nome normalizado -> descrição de onde ficou
todos_nomes = []
for mid, (mnome, ic, cor, cor2, cats) in MOD.items():
    assert len(cats) == 6, mid
    lista = []
    for (cid, cnome, cdesc, nomes) in cats:
        assert len(nomes) == 4, (mid, cid)
        tit = collections.OrderedDict()
        for nv, (m, f) in zip(NV, nomes):
            tid = 'hab-%s-%s-%s' % (mid, {'fundamentos':'free','iniciante':'ini','intermediario':'int','tecnico':'tec'}[nv], cid)
            item = {'id': tid, 'nome': m, 'nomeF': f}
            if norm(m) in sug_norm: item['sugestao'] = True; destino[norm(m)] = ('habilidade', '%s · %s · %s' % (mnome, cnome, dict((a, b) for a, b, _ in NIVEIS)[nv]))
            tit[nv] = item
            todos_nomes.append((m, tid))
        lista.append({'id': cid, 'nome': cnome, 'desc': cdesc, 'titulos': tit})
    modalidades[mid] = {'nome': mnome, 'icone': ic, 'cor': cor, 'corAlt': cor2, 'categorias': lista,
                        'cobertura': COBERTURA[mid], 'coberturaNota': COBERTURA_NOTA[mid]}

for r in REPUTACAO:
    r['tiers'] = [{'n': i + 1, 'rotulo': ['I', 'II', 'III'][i], 'regra': t} for i, t in enumerate(r['tiers'])]
    if norm(r['nome']) in sug_norm: r['sugestao'] = True; destino[norm(r['nome'])] = ('reputacao', 'Reputação')
    todos_nomes.append((r['nome'], r['id']))
for t in TRANSVERSAIS:
    if t.get('tiersTexto'):
        t['tiers'] = [{'n': i + 1, 'rotulo': ['I', 'II', 'III'][i], 'regra': x + '.'} for i, x in enumerate(t.pop('tiersTexto'))]
    else:
        t['tiers'] = [{'n': i + 1, 'rotulo': ['I', 'II', 'III'][i], 'regra': x + ' em ' + t['habilidade'] + '.'} for i, x in enumerate(TIERS_TRANS)]
    if norm(t['nome']) in sug_norm: t['sugestao'] = True; destino[norm(t['nome'])] = ('transversal', 'Habilidade transversal · ' + t['escopo'])
    todos_nomes.append((t['nome'], t['id']))

# --- verificações
falta = [s for s in SUGESTOES if norm(s) not in destino]
cont = collections.Counter(norm(n) for n, _ in todos_nomes)
dup = [n for n, c in cont.items() if c > 1]
print('títulos de habilidade:', sum(len(c['titulos']) for m in modalidades.values() for c in m['categorias']))
print('sugestões sem destino:', falta)
print('nomes repetidos:', dup)
cab = collections.Counter(n.split()[0] for n, _ in todos_nomes)
print('palavras de abertura mais usadas:', cab.most_common(12))
if falta or dup: sys.exit(1)

classificacao = [{'nome': s, 'tipo': destino[norm(s)][0], 'destino': destino[norm(s)][1]} for s in SUGESTOES]
print(collections.Counter(c['tipo'] for c in classificacao))

dados = {
  'versao': '1.0.0',
  'niveis': [{'id': a, 'nome': b, 'foco': c} for a, b, c in NIVEIS],
  'tiers': TIERS,
  'modalidades': modalidades,
  'reputacao': REPUTACAO,
  'transversais': TRANSVERSAIS,
  'classificacao': classificacao,
}
js = open(sys.argv[1]).read().replace('/*__DADOS__*/', json.dumps(dados, ensure_ascii=False, indent=2))
open(sys.argv[2], 'w').write(js)
print('ok ->', sys.argv[2])
