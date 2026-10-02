import type { ModeloExercicio } from '../../exercicios/tipos';

/** Treino permanente — Mapa do braço (BLUEPRINT §3). */
export const MAPA_DO_BRACO: ModeloExercicio[] = [
  {
    id: 'mapa-nome-ponto',
    titulo: 'Que nota é esta?',
    formato: 'quiz-braco',
    gerador: 'quizNomePonto',
    params: { rodadas: 8, faixa: [0, 12] },
    minutos: 3,
  },
  {
    id: 'mapa-tocar-nota',
    titulo: 'Toque a nota pedida',
    formato: 'quiz-braco',
    gerador: 'quizTocarNota',
    params: { rodadas: 8, faixa: [0, 12] },
    minutos: 3,
  },
  {
    id: 'mapa-tocar-nota-corda',
    titulo: 'Toque a nota na corda pedida',
    formato: 'quiz-braco',
    gerador: 'quizTocarNota',
    params: { rodadas: 8, faixa: [0, 12], porCorda: true },
    minutos: 3,
  },
  {
    id: 'mapa-todas-notas',
    titulo: 'Todas as notas, com metrônomo',
    formato: 'ver-tocar',
    gerador: 'todasAsNotas',
    params: { faixa: [0, 15] },
    bpm: { inicial: 50, passo: 4, recuo: 8, minimo: 30 },
    usaTom: true,
    minutos: 5,
  },
  {
    id: 'mapa-oitavas',
    titulo: 'Padrões de oitava',
    formato: 'ver-tocar',
    gerador: 'oitavas',
    params: {},
    bpm: { inicial: 60, passo: 4, recuo: 8, minimo: 40 },
    usaTom: true,
    minutos: 3,
  },
  {
    id: 'mapa-casa-12',
    titulo: 'Depois da casa 12, tudo se repete',
    formato: 'quiz-braco',
    gerador: 'quizNomePonto',
    params: { rodadas: 8, faixa: [12, 15] },
    minutos: 2,
  },
];
