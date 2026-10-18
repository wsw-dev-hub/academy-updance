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
 *     multiestilo: true → desafios mx-* da Árvore de Talentos nas 5
 *     linguagens; gravados em talent_rep_titulos como <id>-<tier>.
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

  var T = {
  "versao": "1.0.0",
  "niveis": [
    {
      "id": "fundamentos",
      "nome": "Free",
      "foco": "Descoberta: primeiro contato com o vocabulário."
    },
    {
      "id": "iniciante",
      "nome": "Iniciante",
      "foco": "Construção: repetir com controle e ligar movimentos."
    },
    {
      "id": "intermediario",
      "nome": "Intermediário",
      "foco": "Domínio: variar, combinar e aplicar em música e roda."
    },
    {
      "id": "tecnico",
      "nome": "Técnico",
      "foco": "Maestria: assinatura própria, precisão e repertório amplo."
    }
  ],
  "tiers": [
    {
      "n": 1,
      "rotulo": "I",
      "nome": "Desperto",
      "regra": "Primeiro desafio aprovado da categoria neste nível."
    },
    {
      "n": 2,
      "rotulo": "II",
      "nome": "Afinado",
      "regra": "Metade dos desafios da categoria aprovados neste nível."
    },
    {
      "n": 3,
      "rotulo": "III",
      "nome": "Pleno",
      "regra": "Todos os desafios da categoria aprovados neste nível e uma avaliação da modalidade com nota 85 ou mais."
    }
  ],
  "modalidades": {
    "pop": {
      "nome": "Popping",
      "icone": "mdi-flash",
      "cor": "#110273",
      "corAlt": "#430ABF",
      "categorias": [
        {
          "id": "hit",
          "nome": "Hit / Pop",
          "desc": "Contração e soltura no tempo: o \"pop\" que marca a batida no corpo.",
          "titulos": {
            "fundamentos": {
              "id": "hab-pop-free-hit",
              "nome": "Descobridor do Primeiro Hit",
              "nomeF": "Descobridora do Primeiro Hit"
            },
            "iniciante": {
              "id": "hab-pop-ini-hit",
              "nome": "Amante dos Hits Eternos",
              "nomeF": "Amante dos Hits Eternos",
              "sugestao": true
            },
            "intermediario": {
              "id": "hab-pop-int-hit",
              "nome": "Ferreiro do Contratempo",
              "nomeF": "Ferreira do Contratempo"
            },
            "tecnico": {
              "id": "hab-pop-tec-hit",
              "nome": "Alquimista da Precisão",
              "nomeF": "Alquimista da Precisão",
              "sugestao": true
            }
          }
        },
        {
          "id": "isolacao",
          "nome": "Isolação",
          "desc": "Mover uma parte do corpo mantendo o resto imóvel.",
          "titulos": {
            "fundamentos": {
              "id": "hab-pop-free-isolacao",
              "nome": "Aprendiz das Partes Soltas",
              "nomeF": "Aprendiz das Partes Soltas"
            },
            "iniciante": {
              "id": "hab-pop-ini-isolacao",
              "nome": "Lapidador dos Eixos Isolados",
              "nomeF": "Lapidadora dos Eixos Isolados"
            },
            "intermediario": {
              "id": "hab-pop-int-isolacao",
              "nome": "Engenheiro da Isolação",
              "nomeF": "Engenheira da Isolação",
              "sugestao": true
            },
            "tecnico": {
              "id": "hab-pop-tec-isolacao",
              "nome": "Mestre das Mil Engrenagens",
              "nomeF": "Mestra das Mil Engrenagens"
            }
          }
        },
        {
          "id": "waving",
          "nome": "Waving",
          "desc": "Ondas que atravessam braços e tronco sem quebrar a linha.",
          "titulos": {
            "fundamentos": {
              "id": "hab-pop-free-waving",
              "nome": "Explorador das Primeiras Ondas",
              "nomeF": "Exploradora das Primeiras Ondas"
            },
            "iniciante": {
              "id": "hab-pop-ini-waving",
              "nome": "Navegador da Correnteza",
              "nomeF": "Navegadora da Correnteza"
            },
            "intermediario": {
              "id": "hab-pop-int-waving",
              "nome": "Restaurador das Ondas Invisíveis",
              "nomeF": "Restauradora das Ondas Invisíveis",
              "sugestao": true
            },
            "tecnico": {
              "id": "hab-pop-tec-waving",
              "nome": "Soberano das Marés Contínuas",
              "nomeF": "Soberana das Marés Contínuas"
            }
          }
        },
        {
          "id": "tutting",
          "nome": "Tutting",
          "desc": "Ângulos retos, caixas e figuras geométricas com braços e mãos.",
          "titulos": {
            "fundamentos": {
              "id": "hab-pop-free-tutting",
              "nome": "Riscador dos Ângulos Retos",
              "nomeF": "Riscadora dos Ângulos Retos"
            },
            "iniciante": {
              "id": "hab-pop-ini-tutting",
              "nome": "Construtor de Caixas no Ar",
              "nomeF": "Construtora de Caixas no Ar"
            },
            "intermediario": {
              "id": "hab-pop-int-tutting",
              "nome": "Navegador das Transições Geométricas",
              "nomeF": "Navegadora das Transições Geométricas",
              "sugestao": true
            },
            "tecnico": {
              "id": "hab-pop-tec-tutting",
              "nome": "Portador do Tutting Ancestral",
              "nomeF": "Portadora do Tutting Ancestral",
              "sugestao": true
            }
          }
        },
        {
          "id": "animation",
          "nome": "Animation",
          "desc": "Robot, strobing, ticking e dime stops: o corpo em quadros.",
          "titulos": {
            "fundamentos": {
              "id": "hab-pop-free-animation",
              "nome": "Curioso do Corpo Robótico",
              "nomeF": "Curiosa do Corpo Robótico"
            },
            "iniciante": {
              "id": "hab-pop-ini-animation",
              "nome": "Domador do Strobe",
              "nomeF": "Domadora do Strobe"
            },
            "intermediario": {
              "id": "hab-pop-int-animation",
              "nome": "Escultor do Robot",
              "nomeF": "Escultora do Robot"
            },
            "tecnico": {
              "id": "hab-pop-tec-animation",
              "nome": "Mago do Tempo Congelado",
              "nomeF": "Maga do Tempo Congelado"
            }
          }
        },
        {
          "id": "musicalidade",
          "nome": "Musicalidade",
          "desc": "Ouvir camadas do funk e escolher o que marcar no corpo.",
          "titulos": {
            "fundamentos": {
              "id": "hab-pop-free-musicalidade",
              "nome": "Ouvinte do Grave",
              "nomeF": "Ouvinte do Grave"
            },
            "iniciante": {
              "id": "hab-pop-ini-musicalidade",
              "nome": "Caçador de Batidas Escondidas",
              "nomeF": "Caçadora de Batidas Escondidas"
            },
            "intermediario": {
              "id": "hab-pop-int-musicalidade",
              "nome": "Narrador do Funk em Movimento",
              "nomeF": "Narradora do Funk em Movimento"
            },
            "tecnico": {
              "id": "hab-pop-tec-musicalidade",
              "nome": "Oráculo das Camadas Sonoras",
              "nomeF": "Oráculo das Camadas Sonoras"
            }
          }
        }
      ],
      "cobertura": {
        "fundamentos": true,
        "iniciante": true,
        "intermediario": true,
        "tecnico": false
      },
      "coberturaNota": "Free (Vocabulário Popping), Iniciante (Básicos · Popping) e Intermediário (Groove, Improviso e História do Popping)."
    },
    "lock": {
      "nome": "Locking",
      "icone": "mdi-lock",
      "cor": "#F2B807",
      "corAlt": "#8C0783",
      "categorias": [
        {
          "id": "locks",
          "nome": "Locks & Points",
          "desc": "A trava (lock) e os apontamentos (points) que dão nome ao estilo.",
          "titulos": {
            "fundamentos": {
              "id": "hab-lock-free-locks",
              "nome": "Aprendiz do Primeiro Lock",
              "nomeF": "Aprendiz do Primeiro Lock"
            },
            "iniciante": {
              "id": "hab-lock-ini-locks",
              "nome": "Apontador das Verdades",
              "nomeF": "Apontadora das Verdades"
            },
            "intermediario": {
              "id": "hab-lock-int-locks",
              "nome": "Portador do Lock Místico",
              "nomeF": "Portadora do Lock Místico",
              "sugestao": true
            },
            "tecnico": {
              "id": "hab-lock-tec-locks",
              "nome": "Herdeiro do Campbellock",
              "nomeF": "Herdeira do Campbellock"
            }
          }
        },
        {
          "id": "footwork",
          "nome": "Footwork",
          "desc": "Stop and go, scooby doo, skeeter rabbit e o trabalho de pernas.",
          "titulos": {
            "fundamentos": {
              "id": "hab-lock-free-footwork",
              "nome": "Andarilho do Stop and Go",
              "nomeF": "Andarilha do Stop and Go"
            },
            "iniciante": {
              "id": "hab-lock-ini-footwork",
              "nome": "Corredor das Pernas Alegres",
              "nomeF": "Corredora das Pernas Alegres"
            },
            "intermediario": {
              "id": "hab-lock-int-footwork",
              "nome": "Saltador do Skeeter Rabbit",
              "nomeF": "Saltadora do Skeeter Rabbit"
            },
            "tecnico": {
              "id": "hab-lock-tec-footwork",
              "nome": "Lenda dos Pés Ligeiros",
              "nomeF": "Lenda dos Pés Ligeiros"
            }
          }
        },
        {
          "id": "bracos",
          "nome": "Giros & Wrist Rolls",
          "desc": "Twirls, wrist rolls e a leveza dos braços e punhos.",
          "titulos": {
            "fundamentos": {
              "id": "hab-lock-free-bracos",
              "nome": "Curioso dos Pulsos Soltos",
              "nomeF": "Curiosa dos Pulsos Soltos"
            },
            "iniciante": {
              "id": "hab-lock-ini-bracos",
              "nome": "Lapidador dos Giros de Pulso",
              "nomeF": "Lapidadora dos Giros de Pulso"
            },
            "intermediario": {
              "id": "hab-lock-int-bracos",
              "nome": "Tecelão dos Twirls",
              "nomeF": "Tecelã dos Twirls"
            },
            "tecnico": {
              "id": "hab-lock-tec-bracos",
              "nome": "Mago dos Punhos Dourados",
              "nomeF": "Maga dos Punhos Dourados"
            }
          }
        },
        {
          "id": "drops",
          "nome": "Drops & Acrobacias",
          "desc": "Knee drops, splits e saltos: a queda que vira efeito.",
          "titulos": {
            "fundamentos": {
              "id": "hab-lock-free-drops",
              "nome": "Desbravador do Primeiro Drop",
              "nomeF": "Desbravadora do Primeiro Drop"
            },
            "iniciante": {
              "id": "hab-lock-ini-drops",
              "nome": "Domador do Knee Drop",
              "nomeF": "Domadora do Knee Drop"
            },
            "intermediario": {
              "id": "hab-lock-int-drops",
              "nome": "Acrobata do Split Relâmpago",
              "nomeF": "Acrobata do Split Relâmpago"
            },
            "tecnico": {
              "id": "hab-lock-tec-drops",
              "nome": "Soberano da Queda Perfeita",
              "nomeF": "Soberana da Queda Perfeita"
            }
          }
        },
        {
          "id": "musicalidade",
          "nome": "Musicalidade",
          "desc": "Funk e soul dos anos 70: tempos, pausas e acentos.",
          "titulos": {
            "fundamentos": {
              "id": "hab-lock-free-musicalidade",
              "nome": "Ouvinte do Funk",
              "nomeF": "Ouvinte do Funk"
            },
            "iniciante": {
              "id": "hab-lock-ini-musicalidade",
              "nome": "Contador de Tempos Quebrados",
              "nomeF": "Contadora de Tempos Quebrados"
            },
            "intermediario": {
              "id": "hab-lock-int-musicalidade",
              "nome": "Artífice do Ritmo",
              "nomeF": "Artífice do Ritmo",
              "sugestao": true
            },
            "tecnico": {
              "id": "hab-lock-tec-musicalidade",
              "nome": "Maestro do Groove Setentista",
              "nomeF": "Maestrina do Groove Setentista"
            }
          }
        },
        {
          "id": "flava",
          "nome": "Flava & Showmanship",
          "desc": "Personalidade, humor e interação com a plateia.",
          "titulos": {
            "fundamentos": {
              "id": "hab-lock-free-flava",
              "nome": "Dono do Sorriso na Roda",
              "nomeF": "Dona do Sorriso na Roda"
            },
            "iniciante": {
              "id": "hab-lock-ini-flava",
              "nome": "Animador da Roda",
              "nomeF": "Animadora da Roda"
            },
            "intermediario": {
              "id": "hab-lock-int-flava",
              "nome": "Palhaço Real da Roda",
              "nomeF": "Palhaça Real da Roda"
            },
            "tecnico": {
              "id": "hab-lock-tec-flava",
              "nome": "Mestre do Flava",
              "nomeF": "Mestra do Flava",
              "sugestao": true
            }
          }
        }
      ],
      "cobertura": {
        "fundamentos": false,
        "iniciante": false,
        "intermediario": true,
        "tecnico": false
      },
      "coberturaNota": "Intermediário (História, vocabulário e coreografia de Locking)."
    },
    "break": {
      "nome": "Breaking",
      "icone": "mdi-rotate-360",
      "cor": "#5C4A3F",
      "corAlt": "#A08672",
      "categorias": [
        {
          "id": "toprock",
          "nome": "Toprock & Up Rock",
          "desc": "A dança em pé que abre a entrada e conversa com o oponente.",
          "titulos": {
            "fundamentos": {
              "id": "hab-break-free-toprock",
              "nome": "Calouro do Toprock",
              "nomeF": "Caloura do Toprock"
            },
            "iniciante": {
              "id": "hab-break-ini-toprock",
              "nome": "Andarilho do Indian Step",
              "nomeF": "Andarilha do Indian Step"
            },
            "intermediario": {
              "id": "hab-break-int-toprock",
              "nome": "Artesão do Toprock Afiado",
              "nomeF": "Artesã do Toprock Afiado"
            },
            "tecnico": {
              "id": "hab-break-tec-toprock",
              "nome": "Guia do Toprock Lendário",
              "nomeF": "Guia do Toprock Lendário",
              "sugestao": true
            }
          }
        },
        {
          "id": "godowns",
          "nome": "Go-Downs & Transições",
          "desc": "O caminho do pé ao chão e de volta, sem perder o tempo.",
          "titulos": {
            "fundamentos": {
              "id": "hab-break-free-godowns",
              "nome": "Explorador do Caminho ao Chão",
              "nomeF": "Exploradora do Caminho ao Chão"
            },
            "iniciante": {
              "id": "hab-break-ini-godowns",
              "nome": "Navegador dos Go-Downs",
              "nomeF": "Navegadora dos Go-Downs"
            },
            "intermediario": {
              "id": "hab-break-int-godowns",
              "nome": "Arquiteto das Descidas",
              "nomeF": "Arquiteta das Descidas"
            },
            "tecnico": {
              "id": "hab-break-tec-godowns",
              "nome": "Mestre das Passagens Invisíveis",
              "nomeF": "Mestra das Passagens Invisíveis"
            }
          }
        },
        {
          "id": "footwork",
          "nome": "Footwork",
          "desc": "Six-step, three-step, CCs e variações no chão.",
          "titulos": {
            "fundamentos": {
              "id": "hab-break-free-footwork",
              "nome": "Aprendiz do Six-Step",
              "nomeF": "Aprendiz do Six-Step"
            },
            "iniciante": {
              "id": "hab-break-ini-footwork",
              "nome": "Tecelão dos Passos no Chão",
              "nomeF": "Tecelã dos Passos no Chão"
            },
            "intermediario": {
              "id": "hab-break-int-footwork",
              "nome": "Alfaiate de Histórias no Chão",
              "nomeF": "Alfaiate de Histórias no Chão",
              "sugestao": true
            },
            "tecnico": {
              "id": "hab-break-tec-footwork",
              "nome": "Soberano do Círculo Infinito",
              "nomeF": "Soberana do Círculo Infinito"
            }
          }
        },
        {
          "id": "freezes",
          "nome": "Freezes",
          "desc": "Congelar o corpo em equilíbrio: baby freeze, chair, airbaby.",
          "titulos": {
            "fundamentos": {
              "id": "hab-break-free-freezes",
              "nome": "Curioso do Corpo Suspenso",
              "nomeF": "Curiosa do Corpo Suspenso"
            },
            "iniciante": {
              "id": "hab-break-ini-freezes",
              "nome": "Explorador do Espaço Negativo",
              "nomeF": "Exploradora do Espaço Negativo",
              "sugestao": true
            },
            "intermediario": {
              "id": "hab-break-int-freezes",
              "nome": "Contador de Segundos Suspensos",
              "nomeF": "Contadora de Segundos Suspensos"
            },
            "tecnico": {
              "id": "hab-break-tec-freezes",
              "nome": "Escultor do Tempo Parado",
              "nomeF": "Escultora do Tempo Parado"
            }
          }
        },
        {
          "id": "power",
          "nome": "Power Moves",
          "desc": "Giros contínuos: backspin, windmill, swipe, flare.",
          "titulos": {
            "fundamentos": {
              "id": "hab-break-free-power",
              "nome": "Desbravador do Primeiro Giro",
              "nomeF": "Desbravadora do Primeiro Giro"
            },
            "iniciante": {
              "id": "hab-break-ini-power",
              "nome": "Caçador do Impulso",
              "nomeF": "Caçadora do Impulso"
            },
            "intermediario": {
              "id": "hab-break-int-power",
              "nome": "Domador do Eixo Invertido",
              "nomeF": "Domadora do Eixo Invertido"
            },
            "tecnico": {
              "id": "hab-break-tec-power",
              "nome": "Furacão do Eixo Infinito",
              "nomeF": "Furacão do Eixo Infinito"
            }
          }
        },
        {
          "id": "batalha",
          "nome": "Musicalidade & Batalha",
          "desc": "Break beat, estrutura de round, resposta e estratégia.",
          "titulos": {
            "fundamentos": {
              "id": "hab-break-free-batalha",
              "nome": "Ouvinte do Break Beat",
              "nomeF": "Ouvinte do Break Beat"
            },
            "iniciante": {
              "id": "hab-break-ini-batalha",
              "nome": "Leitor do Break Beat",
              "nomeF": "Leitora do Break Beat"
            },
            "intermediario": {
              "id": "hab-break-int-batalha",
              "nome": "Estrategista da Roda",
              "nomeF": "Estrategista da Roda"
            },
            "tecnico": {
              "id": "hab-break-tec-batalha",
              "nome": "Mestre do Round Decisivo",
              "nomeF": "Mestra do Round Decisivo"
            }
          }
        }
      ],
      "cobertura": {
        "fundamentos": false,
        "iniciante": true,
        "intermediario": true,
        "tecnico": true
      },
      "coberturaNota": "Iniciante (Básicos · Top Rock), Intermediário (Top Rock, Groove e Improviso Breaking) e Técnico (Up Rock)."
    },
    "hhd": {
      "nome": "Hip Hop Dance",
      "icone": "mdi-run",
      "cor": "#F27405",
      "corAlt": "#FA33A1",
      "categorias": [
        {
          "id": "bounce",
          "nome": "Bounce & Rock",
          "desc": "Os grooves de base: bounce, rock e o peso que não para.",
          "titulos": {
            "fundamentos": {
              "id": "hab-hhd-free-bounce",
              "nome": "Descobridor do Bounce",
              "nomeF": "Descobridora do Bounce"
            },
            "iniciante": {
              "id": "hab-hhd-ini-bounce",
              "nome": "Navegador do Bounce",
              "nomeF": "Navegadora do Bounce",
              "sugestao": true
            },
            "intermediario": {
              "id": "hab-hhd-int-bounce",
              "nome": "Andarilho do Bounce Infinito",
              "nomeF": "Andarilha do Bounce Infinito",
              "sugestao": true
            },
            "tecnico": {
              "id": "hab-hhd-tec-bounce",
              "nome": "Semeador do Bounce Infinito",
              "nomeF": "Semeadora do Bounce Infinito",
              "sugestao": true
            }
          }
        },
        {
          "id": "steps",
          "nome": "Steps & Footwork",
          "desc": "Passos de deslocamento, cruzados e trabalho de pés.",
          "titulos": {
            "fundamentos": {
              "id": "hab-hhd-free-steps",
              "nome": "Caminhante dos Primeiros Passos",
              "nomeF": "Caminhante dos Primeiros Passos"
            },
            "iniciante": {
              "id": "hab-hhd-ini-steps",
              "nome": "Herói do Step Preciso",
              "nomeF": "Heroína do Step Preciso",
              "sugestao": true
            },
            "intermediario": {
              "id": "hab-hhd-int-steps",
              "nome": "Arquiteto dos Passos Cruzados",
              "nomeF": "Arquiteta dos Passos Cruzados"
            },
            "tecnico": {
              "id": "hab-hhd-tec-steps",
              "nome": "Mestre do Chão em Festa",
              "nomeF": "Mestra do Chão em Festa"
            }
          }
        },
        {
          "id": "party",
          "nome": "Party Dances",
          "desc": "Running man, roger rabbit, kick step e o repertório das festas.",
          "titulos": {
            "fundamentos": {
              "id": "hab-hhd-free-party",
              "nome": "Convidado da Primeira Festa",
              "nomeF": "Convidada da Primeira Festa"
            },
            "iniciante": {
              "id": "hab-hhd-ini-party",
              "nome": "Colecionador de Party Dances",
              "nomeF": "Colecionadora de Party Dances"
            },
            "intermediario": {
              "id": "hab-hhd-int-party",
              "nome": "Anfitrião do Block Party",
              "nomeF": "Anfitriã do Block Party"
            },
            "tecnico": {
              "id": "hab-hhd-tec-party",
              "nome": "Lenda do Old School",
              "nomeF": "Lenda do Old School"
            }
          }
        },
        {
          "id": "texturas",
          "nome": "Texturas & Dinâmicas",
          "desc": "Qualidade do movimento: duro, solto, lento, explosivo.",
          "titulos": {
            "fundamentos": {
              "id": "hab-hhd-free-texturas",
              "nome": "Curioso das Texturas",
              "nomeF": "Curiosa das Texturas"
            },
            "iniciante": {
              "id": "hab-hhd-ini-texturas",
              "nome": "Lapidador de Dinâmicas",
              "nomeF": "Lapidadora de Dinâmicas"
            },
            "intermediario": {
              "id": "hab-hhd-int-texturas",
              "nome": "Tecelão do Groove",
              "nomeF": "Tecelã do Groove",
              "sugestao": true
            },
            "tecnico": {
              "id": "hab-hhd-tec-texturas",
              "nome": "Alquimista dos Contrastes",
              "nomeF": "Alquimista dos Contrastes"
            }
          }
        },
        {
          "id": "musicalidade",
          "nome": "Musicalidade",
          "desc": "Boom bap, rap e camadas do beat traduzidas no corpo.",
          "titulos": {
            "fundamentos": {
              "id": "hab-hhd-free-musicalidade",
              "nome": "Ouvinte do Boom Bap",
              "nomeF": "Ouvinte do Boom Bap"
            },
            "iniciante": {
              "id": "hab-hhd-ini-musicalidade",
              "nome": "Marcador da Batida Seca",
              "nomeF": "Marcadora da Batida Seca"
            },
            "intermediario": {
              "id": "hab-hhd-int-musicalidade",
              "nome": "Decifrador do Beat",
              "nomeF": "Decifradora do Beat"
            },
            "tecnico": {
              "id": "hab-hhd-tec-musicalidade",
              "nome": "Regente do Beat Vivo",
              "nomeF": "Regente do Beat Vivo"
            }
          }
        },
        {
          "id": "freestyle",
          "nome": "Freestyle & Coreografia",
          "desc": "Improvisar e compor: da primeira roda à coreografia autoral.",
          "titulos": {
            "fundamentos": {
              "id": "hab-hhd-free-freestyle",
              "nome": "Desbravador do Primeiro Freestyle",
              "nomeF": "Desbravadora do Primeiro Freestyle"
            },
            "iniciante": {
              "id": "hab-hhd-ini-freestyle",
              "nome": "Construtor de Sequências",
              "nomeF": "Construtora de Sequências"
            },
            "intermediario": {
              "id": "hab-hhd-int-freestyle",
              "nome": "Autor de Coreografias Vivas",
              "nomeF": "Autora de Coreografias Vivas"
            },
            "tecnico": {
              "id": "hab-hhd-tec-freestyle",
              "nome": "Visionário da Cena",
              "nomeF": "Visionária da Cena"
            }
          }
        }
      ],
      "cobertura": {
        "fundamentos": true,
        "iniciante": true,
        "intermediario": true,
        "tecnico": false
      },
      "coberturaNota": "Free (Vocabulário Hip Hop), Iniciante (Básicos · HipHop) e Intermediário (Groove, Improviso e História do Hip Hop Dance)."
    },
    "house": {
      "nome": "House Dance",
      "icone": "mdi-home-heart",
      "cor": "#030BA6",
      "corAlt": "#FA33A1",
      "categorias": [
        {
          "id": "jacking",
          "nome": "Jacking",
          "desc": "A pulsação do tronco que sustenta toda a dança.",
          "titulos": {
            "fundamentos": {
              "id": "hab-house-free-jacking",
              "nome": "Aprendiz do Primeiro Jack",
              "nomeF": "Aprendiz do Primeiro Jack"
            },
            "iniciante": {
              "id": "hab-house-ini-jacking",
              "nome": "Batedor do Jack Contínuo",
              "nomeF": "Batedora do Jack Contínuo"
            },
            "intermediario": {
              "id": "hab-house-int-jacking",
              "nome": "Emissário do Sacred Groove",
              "nomeF": "Emissária do Sacred Groove"
            },
            "tecnico": {
              "id": "hab-house-tec-jacking",
              "nome": "Coração do Jack Eterno",
              "nomeF": "Coração do Jack Eterno"
            }
          }
        },
        {
          "id": "footwork",
          "nome": "Footwork",
          "desc": "Shuffles, heel-toe, skates e loose legs.",
          "titulos": {
            "fundamentos": {
              "id": "hab-house-free-footwork",
              "nome": "Explorador dos Pés Leves",
              "nomeF": "Exploradora dos Pés Leves"
            },
            "iniciante": {
              "id": "hab-house-ini-footwork",
              "nome": "Cartógrafo dos Pés Falantes",
              "nomeF": "Cartógrafa dos Pés Falantes"
            },
            "intermediario": {
              "id": "hab-house-int-footwork",
              "nome": "Artesão do Shuffle",
              "nomeF": "Artesã do Shuffle"
            },
            "tecnico": {
              "id": "hab-house-tec-footwork",
              "nome": "Mestre do Chão Flutuante",
              "nomeF": "Mestra do Chão Flutuante"
            }
          }
        },
        {
          "id": "lofting",
          "nome": "Lofting & Chão",
          "desc": "Descer, rolar e voltar ao pé no fluxo da música.",
          "titulos": {
            "fundamentos": {
              "id": "hab-house-free-lofting",
              "nome": "Curioso do Chão",
              "nomeF": "Curiosa do Chão"
            },
            "iniciante": {
              "id": "hab-house-ini-lofting",
              "nome": "Domador da Queda Livre",
              "nomeF": "Domadora da Queda Livre"
            },
            "intermediario": {
              "id": "hab-house-int-lofting",
              "nome": "Planador do Lofting",
              "nomeF": "Planadora do Lofting"
            },
            "tecnico": {
              "id": "hab-house-tec-lofting",
              "nome": "Senhor do Voo Rasante",
              "nomeF": "Senhora do Voo Rasante"
            }
          }
        },
        {
          "id": "swing",
          "nome": "Swing & Fluidez",
          "desc": "Balanço, ondulação e transferências sem quebra.",
          "titulos": {
            "fundamentos": {
              "id": "hab-house-free-swing",
              "nome": "Brincante do Balanço",
              "nomeF": "Brincante do Balanço"
            },
            "iniciante": {
              "id": "hab-house-ini-swing",
              "nome": "Viajante do Swing",
              "nomeF": "Viajante do Swing"
            },
            "intermediario": {
              "id": "hab-house-int-swing",
              "nome": "Guia do Círculo Contínuo",
              "nomeF": "Guia do Círculo Contínuo"
            },
            "tecnico": {
              "id": "hab-house-tec-swing",
              "nome": "Mago do Swing Suave",
              "nomeF": "Maga do Swing Suave",
              "sugestao": true
            }
          }
        },
        {
          "id": "feeling",
          "nome": "Musicalidade & Feeling",
          "desc": "Four-on-the-floor, vocais e a emoção da faixa.",
          "titulos": {
            "fundamentos": {
              "id": "hab-house-free-feeling",
              "nome": "Ouvinte do Four-on-the-Floor",
              "nomeF": "Ouvinte do Four-on-the-Floor"
            },
            "iniciante": {
              "id": "hab-house-ini-feeling",
              "nome": "Explorador do Feeling",
              "nomeF": "Exploradora do Feeling",
              "sugestao": true
            },
            "intermediario": {
              "id": "hab-house-int-feeling",
              "nome": "Tradutor do Deep House",
              "nomeF": "Tradutora do Deep House"
            },
            "tecnico": {
              "id": "hab-house-tec-feeling",
              "nome": "Alma do Groove Profundo",
              "nomeF": "Alma do Groove Profundo"
            }
          }
        },
        {
          "id": "freestyle",
          "nome": "Freestyle & Roda",
          "desc": "Improviso no círculo: escutar, responder e criar na hora.",
          "titulos": {
            "fundamentos": {
              "id": "hab-house-free-freestyle",
              "nome": "Recém-chegado ao Círculo",
              "nomeF": "Recém-chegada ao Círculo"
            },
            "iniciante": {
              "id": "hab-house-ini-freestyle",
              "nome": "Improvisador do Círculo",
              "nomeF": "Improvisadora do Círculo"
            },
            "intermediario": {
              "id": "hab-house-int-freestyle",
              "nome": "Poeta do Freestyle",
              "nomeF": "Poeta do Freestyle"
            },
            "tecnico": {
              "id": "hab-house-tec-freestyle",
              "nome": "Espírito Livre da Pista",
              "nomeF": "Espírito Livre da Pista"
            }
          }
        }
      ],
      "cobertura": {
        "fundamentos": false,
        "iniciante": false,
        "intermediario": false,
        "tecnico": true
      },
      "coberturaNota": "Técnico (House Dance I e II)."
    }
  },
  "reputacao": [
    {
      "id": "rep-guardiao-cipher",
      "nome": "Guardião do Cipher",
      "nomeF": "Guardiã do Cipher",
      "icone": "mdi-account-group",
      "cor": "#5C4A3F",
      "desc": "Está sempre na roda: chega, assiste, entra e faz o cypher acontecer.",
      "tiers": [
        {
          "n": 1,
          "rotulo": "I",
          "regra": "3 presenças em rodas, cyphers ou battles"
        },
        {
          "n": 2,
          "rotulo": "II",
          "regra": "10 presenças"
        },
        {
          "n": 3,
          "rotulo": "III",
          "regra": "25 presenças"
        }
      ],
      "fonte": "evento_participacoes (situacao = presente; tipo roda, cypher ou battle)",
      "dados": "disponivel",
      "sugestao": true
    },
    {
      "id": "rep-condutor-liberdade",
      "nome": "Condutor da Liberdade Criativa",
      "nomeF": "Condutora da Liberdade Criativa",
      "icone": "mdi-microphone-variant",
      "cor": "#030BA6",
      "desc": "Abre espaço para os outros criarem: conduz rodas, jams e sessões livres.",
      "tiers": [
        {
          "n": 1,
          "rotulo": "I",
          "regra": "Conduziu 1 roda, jam ou sessão (papel de condução no evento)"
        },
        {
          "n": 2,
          "rotulo": "II",
          "regra": "5 conduções"
        },
        {
          "n": 3,
          "rotulo": "III",
          "regra": "15 conduções"
        }
      ],
      "fonte": "evento_participacoes.papel (condutor, host, jurado, DJ)",
      "dados": "disponivel",
      "sugestao": true
    },
    {
      "id": "rep-chama-hiphop",
      "nome": "Portador da Chama do Hip-Hop",
      "nomeF": "Portadora da Chama do Hip-Hop",
      "icone": "mdi-fire",
      "cor": "#F27405",
      "desc": "Conhece e carrega a cultura: história, valores e os cinco elementos.",
      "tiers": [
        {
          "n": 1,
          "rotulo": "I",
          "regra": "Concluiu \"A Cultura Hip Hop\" no Intermediário"
        },
        {
          "n": 2,
          "rotulo": "II",
          "regra": "+ 5 presenças em eventos culturais"
        },
        {
          "n": 3,
          "rotulo": "III",
          "regra": "+ 12 presenças em eventos culturais"
        }
      ],
      "fonte": "trilha_progresso (nó i2 de cultura) + evento_participacoes",
      "dados": "disponivel",
      "sugestao": true
    },
    {
      "id": "rep-legados-asfalto",
      "nome": "Forjador de Legados no Asfalto",
      "nomeF": "Forjadora de Legados no Asfalto",
      "icone": "mdi-road-variant",
      "cor": "#BF0449",
      "desc": "Constância de quem constrói a própria história mês a mês.",
      "tiers": [
        {
          "n": 1,
          "rotulo": "I",
          "regra": "6 meses diferentes com desafio aprovado"
        },
        {
          "n": 2,
          "rotulo": "II",
          "regra": "12 meses"
        },
        {
          "n": 3,
          "rotulo": "III",
          "regra": "24 meses"
        }
      ],
      "fonte": "trilha_progresso e talent_progresso (reviewed_at, status aprovado)",
      "dados": "disponivel",
      "sugestao": true
    },
    {
      "id": "rep-guardiao-estilo",
      "idLegado": "trans-guardiao",
      "nome": "Guardião do Estilo",
      "nomeF": "Guardiã do Estilo",
      "icone": "mdi-shield-crown",
      "cor": "#F2B807",
      "porEstilo": true,
      "desc": "Protege a assinatura pessoal num estilo: aqui o estilo não se copia, se herda. Pode ser conquistado em cada modalidade.",
      "tiers": [
        {
          "n": 1,
          "rotulo": "I",
          "regra": "Marco 3 de desempenho no estilo (média 72, 10 avaliações)"
        },
        {
          "n": 2,
          "rotulo": "II",
          "regra": "Marco 5 (média 86, 20 avaliações)"
        },
        {
          "n": 3,
          "rotulo": "III",
          "regra": "Marco 7 (média 95, 40 avaliações)"
        }
      ],
      "fonte": "escalaEstilo de reputacao.data.js (avaliações por estilo)",
      "dados": "disponivel",
      "sugestao": true
    },
    {
      "id": "rep-mensageiro-flow",
      "nome": "Mensageiro do Flow Ancestral",
      "nomeF": "Mensageira do Flow Ancestral",
      "icone": "mdi-account-voice",
      "cor": "#8C0783",
      "desc": "Leva adiante o que aprendeu: apoia aulas e passa o vocabulário para quem chega.",
      "tiers": [
        {
          "n": 1,
          "rotulo": "I",
          "regra": "5 aulas apoiadas como Monitor(a) ou Assistente"
        },
        {
          "n": 2,
          "rotulo": "II",
          "regra": "20 aulas"
        },
        {
          "n": 3,
          "rotulo": "III",
          "regra": "50 aulas"
        }
      ],
      "fonte": "registro de aulas apoiadas (ainda não existe no D1)",
      "dados": "pendente",
      "sugestao": true
    },
    {
      "id": "rep-semeador-essencia",
      "idLegado": "trans-semeador",
      "nome": "Semeador da Essência",
      "nomeF": "Semeadora da Essência",
      "icone": "mdi-sprout",
      "cor": "#8C0783",
      "desc": "Planta em cada aula aquilo que germina em outros corpos muito depois.",
      "tiers": [
        {
          "n": 1,
          "rotulo": "I",
          "regra": "Título Professor(a) Certificado(a) na Árvore de Talentos"
        },
        {
          "n": 2,
          "rotulo": "II",
          "regra": "3 alunos(as) orientados(as) promovidos(as) de nível"
        },
        {
          "n": 3,
          "rotulo": "III",
          "regra": "10 alunos(as) promovidos(as)"
        }
      ],
      "fonte": "talent_titulos (prof-titulo); orientação de alunos ainda não existe no D1",
      "dados": "parcial",
      "sugestao": true
    },
    {
      "id": "rep-inspirador-simbolos",
      "idLegado": "trans-inspirador",
      "nome": "Inspirador de Símbolos",
      "nomeF": "Inspiradora de Símbolos",
      "icone": "mdi-star-shooting",
      "cor": "#5708A6",
      "desc": "Seu gesto vira referência: o que você faz hoje é vocabulário de outros amanhã.",
      "tiers": [
        {
          "n": 1,
          "rotulo": "I",
          "regra": "1.500 pontos de reputação"
        },
        {
          "n": 2,
          "rotulo": "II",
          "regra": "4.000 pontos"
        },
        {
          "n": 3,
          "rotulo": "III",
          "regra": "8.000 pontos"
        }
      ],
      "fonte": "pontos de reputação (os mesmos limiares de Referência, Autoridade e Lenda)",
      "dados": "disponivel",
      "sugestao": true
    }
  ],
  "transversais": [
    {
      "id": "trans-forjador",
      "nome": "Forjador do Movimento",
      "nomeF": "Forjadora do Movimento",
      "escopo": "Bailarino(a)",
      "icone": "mdi-hammer",
      "cor": "#F27405",
      "desc": "Não executa passos, os funde: cada dinâmica sai com peso, brilho e propósito.",
      "habilidade": "avaliações de bailarino(a)",
      "tiers": [
        {
          "n": 1,
          "rotulo": "I",
          "regra": "3 avaliações seguidas com nota acima de 80 em avaliações de bailarino(a)."
        },
        {
          "n": 2,
          "rotulo": "II",
          "regra": "3 avaliações seguidas acima de 85 em avaliações de bailarino(a)."
        },
        {
          "n": 3,
          "rotulo": "III",
          "regra": "3 avaliações seguidas acima de 90 (critério atual do título) em avaliações de bailarino(a)."
        }
      ],
      "sugestao": true
    },
    {
      "id": "trans-pilar",
      "nome": "Pilar da Presença",
      "nomeF": "Pilar da Presença",
      "escopo": "Performer",
      "icone": "mdi-pillar",
      "cor": "#FA33A1",
      "desc": "Ocupa o espaço antes mesmo de se mover.",
      "habilidade": "avaliações de performer",
      "tiers": [
        {
          "n": 1,
          "rotulo": "I",
          "regra": "3 avaliações seguidas com nota acima de 80 em avaliações de performer."
        },
        {
          "n": 2,
          "rotulo": "II",
          "regra": "3 avaliações seguidas acima de 85 em avaliações de performer."
        },
        {
          "n": 3,
          "rotulo": "III",
          "regra": "3 avaliações seguidas acima de 90 (critério atual do título) em avaliações de performer."
        }
      ],
      "sugestao": true
    },
    {
      "id": "trans-escultor",
      "nome": "Escultor de Atmosferas",
      "nomeF": "Escultora de Atmosferas",
      "escopo": "Performer (solo)",
      "icone": "mdi-weather-hazy",
      "cor": "#FA33A1",
      "desc": "Muda o clima do ambiente: a plateia esquece de piscar.",
      "habilidade": "avaliações de solo do performer",
      "tiers": [
        {
          "n": 1,
          "rotulo": "I",
          "regra": "3 avaliações seguidas com nota acima de 80 em avaliações de solo do performer."
        },
        {
          "n": 2,
          "rotulo": "II",
          "regra": "3 avaliações seguidas acima de 85 em avaliações de solo do performer."
        },
        {
          "n": 3,
          "rotulo": "III",
          "regra": "3 avaliações seguidas acima de 90 (critério atual do título) em avaliações de solo do performer."
        }
      ],
      "sugestao": true
    },
    {
      "id": "trans-interprete",
      "nome": "Intérprete da Jornada",
      "nomeF": "Intérprete da Jornada",
      "escopo": "Improviso",
      "icone": "mdi-shuffle-variant",
      "cor": "#F27405",
      "desc": "Traduz em movimento o que a palavra não alcança.",
      "habilidade": "avaliações de improviso",
      "tiers": [
        {
          "n": 1,
          "rotulo": "I",
          "regra": "3 avaliações seguidas com nota acima de 80 em avaliações de improviso."
        },
        {
          "n": 2,
          "rotulo": "II",
          "regra": "3 avaliações seguidas acima de 85 em avaliações de improviso."
        },
        {
          "n": 3,
          "rotulo": "III",
          "regra": "3 avaliações seguidas acima de 90 (critério atual do título) em avaliações de improviso."
        }
      ],
      "sugestao": true
    },
    {
      "id": "trans-arquiteto",
      "nome": "Arquiteto do Flow",
      "nomeF": "Arquiteta do Flow",
      "escopo": "Popping + Coreografia",
      "icone": "mdi-vector-polyline",
      "cor": "#430ABF",
      "desc": "Projeta rotas invisíveis por onde o movimento corre sem esbarrar em si mesmo.",
      "habilidade": "avaliações de popping e de coreografia",
      "tiers": [
        {
          "n": 1,
          "rotulo": "I",
          "regra": "3 avaliações seguidas com nota acima de 80 em avaliações de popping e de coreografia."
        },
        {
          "n": 2,
          "rotulo": "II",
          "regra": "3 avaliações seguidas acima de 85 em avaliações de popping e de coreografia."
        },
        {
          "n": 3,
          "rotulo": "III",
          "regra": "3 avaliações seguidas acima de 90 (critério atual do título) em avaliações de popping e de coreografia."
        }
      ],
      "sugestao": true
    },
    {
      "id": "trans-cadencias",
      "nome": "Mestre das Cadências",
      "nomeF": "Mestra das Cadências",
      "escopo": "Bailarino(a) · 5 linguagens",
      "icone": "mdi-metronome",
      "cor": "#F20505",
      "multiestilo": true,
      "perfil": "bailarino",
      "habilidadeArvore": "bal-multi",
      "desc": "Domínio técnico de verdade em linguagens diferentes: cada estilo com a sua cadência.",
      "tiers": [
        {
          "n": 1,
          "rotulo": "I",
          "regra": "2 linguagens diferentes com nota acima de 80 em \"Solo técnico\"."
        },
        {
          "n": 2,
          "rotulo": "II",
          "regra": "3 linguagens diferentes com nota acima de 85 em \"Solo técnico\"."
        },
        {
          "n": 3,
          "rotulo": "III",
          "regra": "5 linguagens diferentes com nota acima de 90 em \"Solo técnico\"."
        }
      ]
    },
    {
      "id": "trans-linguagens",
      "nome": "Oráculo das Linguagens",
      "nomeF": "Oráculo das Linguagens",
      "escopo": "Bailarino(a) · 5 linguagens",
      "icone": "mdi-eye-circle-outline",
      "cor": "#F20505",
      "multiestilo": true,
      "perfil": "bailarino",
      "habilidadeArvore": "bal-multi",
      "desc": "Funde linguagens numa mesma coreografia sem apagar a assinatura de nenhuma delas.",
      "tiers": [
        {
          "n": 1,
          "rotulo": "I",
          "regra": "2 linguagens diferentes com nota acima de 80 em \"Coreografia de fusão\"."
        },
        {
          "n": 2,
          "rotulo": "II",
          "regra": "3 linguagens diferentes com nota acima de 85 em \"Coreografia de fusão\"."
        },
        {
          "n": 3,
          "rotulo": "III",
          "regra": "5 linguagens diferentes com nota acima de 90 em \"Coreografia de fusão\"."
        }
      ]
    },
    {
      "id": "trans-nomade",
      "nome": "Nômade do Groove",
      "nomeF": "Nômade do Groove",
      "escopo": "Performer · 5 linguagens",
      "icone": "mdi-compass-rose",
      "cor": "#FA33A1",
      "multiestilo": true,
      "perfil": "performer",
      "habilidadeArvore": "perf-multi",
      "desc": "Atravessa estilos no freestyle: a música muda e o corpo responde na língua certa.",
      "tiers": [
        {
          "n": 1,
          "rotulo": "I",
          "regra": "2 linguagens diferentes com nota acima de 80 em \"Round de freestyle\"."
        },
        {
          "n": 2,
          "rotulo": "II",
          "regra": "3 linguagens diferentes com nota acima de 85 em \"Round de freestyle\"."
        },
        {
          "n": 3,
          "rotulo": "III",
          "regra": "5 linguagens diferentes com nota acima de 90 em \"Round de freestyle\"."
        }
      ]
    },
    {
      "id": "trans-regente",
      "nome": "Regente do Movimento",
      "nomeF": "Regente do Movimento",
      "escopo": "Performer · 5 linguagens",
      "icone": "mdi-movie-open-star-outline",
      "cor": "#FA33A1",
      "multiestilo": true,
      "perfil": "performer",
      "habilidadeArvore": "perf-multi",
      "desc": "Concebe e dirige números em que cada trecho fala uma linguagem diferente.",
      "tiers": [
        {
          "n": 1,
          "rotulo": "I",
          "regra": "2 linguagens diferentes com nota acima de 80 em \"Número multiestilo\"."
        },
        {
          "n": 2,
          "rotulo": "II",
          "regra": "3 linguagens diferentes com nota acima de 85 em \"Número multiestilo\"."
        },
        {
          "n": 3,
          "rotulo": "III",
          "regra": "5 linguagens diferentes com nota acima de 90 em \"Número multiestilo\"."
        }
      ]
    },
    {
      "id": "trans-dialetos",
      "nome": "Guardião dos Dialetos Urbanos",
      "nomeF": "Guardiã dos Dialetos Urbanos",
      "escopo": "Professor(a) · 5 linguagens",
      "icone": "mdi-translate",
      "cor": "#5708A6",
      "multiestilo": true,
      "perfil": "professor",
      "habilidadeArvore": "prof-multi",
      "desc": "Ensina cada linguagem com a mesma segurança, do vocabulário à musicalidade.",
      "tiers": [
        {
          "n": 1,
          "rotulo": "I",
          "regra": "2 linguagens diferentes com nota acima de 80 em \"Aula\"."
        },
        {
          "n": 2,
          "rotulo": "II",
          "regra": "3 linguagens diferentes com nota acima de 85 em \"Aula\"."
        },
        {
          "n": 3,
          "rotulo": "III",
          "regra": "5 linguagens diferentes com nota acima de 90 em \"Aula\"."
        }
      ]
    },
    {
      "id": "trans-cronista",
      "nome": "Cronista das Cinco Escolas",
      "nomeF": "Cronista das Cinco Escolas",
      "escopo": "Professor(a) · 5 linguagens",
      "icone": "mdi-book-open-page-variant-outline",
      "cor": "#5708A6",
      "multiestilo": true,
      "perfil": "professor",
      "habilidadeArvore": "prof-multi",
      "desc": "Conhece e conta a origem, os pioneiros e os fundamentos das cinco escolas.",
      "tiers": [
        {
          "n": 1,
          "rotulo": "I",
          "regra": "2 linguagens diferentes com nota acima de 80 em \"Seminário de raízes\"."
        },
        {
          "n": 2,
          "rotulo": "II",
          "regra": "3 linguagens diferentes com nota acima de 85 em \"Seminário de raízes\"."
        },
        {
          "n": 3,
          "rotulo": "III",
          "regra": "5 linguagens diferentes com nota acima de 90 em \"Seminário de raízes\"."
        }
      ]
    }
  ],
  "classificacao": [
    {
      "nome": "Artífice do Ritmo",
      "tipo": "habilidade",
      "destino": "Locking · Musicalidade · Intermediário"
    },
    {
      "nome": "Navegador do Bounce",
      "tipo": "habilidade",
      "destino": "Hip Hop Dance · Bounce & Rock · Iniciante"
    },
    {
      "nome": "Tecelão do Groove",
      "tipo": "habilidade",
      "destino": "Hip Hop Dance · Texturas & Dinâmicas · Intermediário"
    },
    {
      "nome": "Mensageiro do Flow Ancestral",
      "tipo": "reputacao",
      "destino": "Reputação"
    },
    {
      "nome": "Arquiteto do Flow",
      "tipo": "transversal",
      "destino": "Habilidade transversal · Popping + Coreografia"
    },
    {
      "nome": "Semeador do Bounce Infinito",
      "tipo": "habilidade",
      "destino": "Hip Hop Dance · Bounce & Rock · Técnico"
    },
    {
      "nome": "Guardião do Estilo",
      "tipo": "reputacao",
      "destino": "Reputação"
    },
    {
      "nome": "Explorador do Espaço Negativo",
      "tipo": "habilidade",
      "destino": "Breaking · Freezes · Iniciante"
    },
    {
      "nome": "Explorador do Feeling",
      "tipo": "habilidade",
      "destino": "House Dance · Musicalidade & Feeling · Iniciante"
    },
    {
      "nome": "Forjador de Legados no Asfalto",
      "tipo": "reputacao",
      "destino": "Reputação"
    },
    {
      "nome": "Mestre do Flava",
      "tipo": "habilidade",
      "destino": "Locking · Flava & Showmanship · Técnico"
    },
    {
      "nome": "Guardião do Cipher",
      "tipo": "reputacao",
      "destino": "Reputação"
    },
    {
      "nome": "Intérprete da Jornada",
      "tipo": "transversal",
      "destino": "Habilidade transversal · Improviso"
    },
    {
      "nome": "Portador da Chama do Hip-Hop",
      "tipo": "reputacao",
      "destino": "Reputação"
    },
    {
      "nome": "Condutor da Liberdade Criativa",
      "tipo": "reputacao",
      "destino": "Reputação"
    },
    {
      "nome": "Escultor de Atmosferas",
      "tipo": "transversal",
      "destino": "Habilidade transversal · Performer (solo)"
    },
    {
      "nome": "Alquimista da Precisão",
      "tipo": "habilidade",
      "destino": "Popping · Hit / Pop · Técnico"
    },
    {
      "nome": "Alfaiate de Histórias no Chão",
      "tipo": "habilidade",
      "destino": "Breaking · Footwork · Intermediário"
    },
    {
      "nome": "Inspirador de Símbolos",
      "tipo": "reputacao",
      "destino": "Reputação"
    },
    {
      "nome": "Portador do Tutting Ancestral",
      "tipo": "habilidade",
      "destino": "Popping · Tutting · Técnico"
    },
    {
      "nome": "Forjador do Movimento",
      "tipo": "transversal",
      "destino": "Habilidade transversal · Bailarino(a)"
    },
    {
      "nome": "Engenheiro da Isolação",
      "tipo": "habilidade",
      "destino": "Popping · Isolação · Intermediário"
    },
    {
      "nome": "Pilar da Presença",
      "tipo": "transversal",
      "destino": "Habilidade transversal · Performer"
    },
    {
      "nome": "Andarilho do Bounce Infinito",
      "tipo": "habilidade",
      "destino": "Hip Hop Dance · Bounce & Rock · Intermediário"
    },
    {
      "nome": "Semeador da Essência",
      "tipo": "reputacao",
      "destino": "Reputação"
    },
    {
      "nome": "Portador do Lock Místico",
      "tipo": "habilidade",
      "destino": "Locking · Locks & Points · Intermediário"
    },
    {
      "nome": "Restaurador das Ondas Invisíveis",
      "tipo": "habilidade",
      "destino": "Popping · Waving · Intermediário"
    },
    {
      "nome": "Guia do Toprock Lendário",
      "tipo": "habilidade",
      "destino": "Breaking · Toprock & Up Rock · Técnico"
    },
    {
      "nome": "Mago do Swing Suave",
      "tipo": "habilidade",
      "destino": "House Dance · Swing & Fluidez · Técnico"
    },
    {
      "nome": "Herói do Step Preciso",
      "tipo": "habilidade",
      "destino": "Hip Hop Dance · Steps & Footwork · Iniciante"
    },
    {
      "nome": "Navegador das Transições Geométricas",
      "tipo": "habilidade",
      "destino": "Popping · Tutting · Intermediário"
    },
    {
      "nome": "Amante dos Hits Eternos",
      "tipo": "habilidade",
      "destino": "Popping · Hit / Pop · Iniciante"
    }
  ]
};

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

  /* Títulos multiestilo gravados com o tier no id: 'trans-cadencias-2' → base + tier 2. */
  T.separarTier = function (id) {
    var m = /^(.*)-([123])$/.exec(String(id || ''));
    if (m && indice[m[1]] && !indice[id]) return { base: m[1], tier: Number(m[2]) };
    return { base: id, tier: 0 };
  };

  /* Nome para exibir: genero 'f' usa a forma feminina; tier (1..3) acrescenta o numeral. */
  T.nomeTitulo = function (id, opc) {
    opc = opc || {};
    var sep = T.separarTier(id);
    if (sep.tier && !opc.tier) { opc = { genero: opc.genero, tier: sep.tier }; }
    id = sep.base;
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
