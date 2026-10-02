import type { ModeloExercicio } from '../../exercicios/tipos';

const BPM = { inicial: 60, passo: 4, recuo: 8, minimo: 40 } as const;
const FORMAS = ['E', 'D', 'C', 'A', 'G'] as ModeloExercicio['formas'];

/** Treino permanente — Aquecimentos (BLUEPRINT §3). Padrões gerados pelo motor. */
export const AQUECIMENTOS_TECNICOS: ModeloExercicio[] = [
  {
    id: 'aquec-independencia',
    titulo: 'Independência dos dedos',
    formato: 'ouca-repita',
    gerador: 'aquecimento',
    params: { tipo: 'independencia' },
    bpm: BPM,
    usaTom: true,
    formas: FORMAS,
    minutos: 2,
  },
  {
    id: 'aquec-horizontal',
    titulo: 'Grupos de 4 na forma',
    formato: 'ouca-repita',
    gerador: 'aquecimento',
    params: { tipo: 'horizontal' },
    bpm: BPM,
    usaTom: true,
    formas: FORMAS,
    minutos: 2,
  },
  {
    id: 'aquec-duas-cordas',
    titulo: 'Duas cordas',
    formato: 'ouca-repita',
    gerador: 'aquecimento',
    params: { tipo: 'duas-cordas' },
    bpm: BPM,
    usaTom: true,
    formas: FORMAS,
    minutos: 2,
  },
  {
    id: 'aquec-vertical',
    titulo: 'Célula vertical',
    formato: 'ouca-repita',
    gerador: 'aquecimento',
    params: { tipo: 'vertical' },
    bpm: BPM,
    usaTom: true,
    formas: FORMAS,
    minutos: 2,
  },
  {
    id: 'aquec-ligados',
    titulo: 'Ligados',
    formato: 'ouca-repita',
    gerador: 'aquecimento',
    params: { tipo: 'ligados' },
    bpm: BPM,
    usaTom: true,
    formas: FORMAS,
    minutos: 2,
  },
  {
    id: 'aquec-escala-maior',
    titulo: 'Escala maior em grupos de 4',
    formato: 'ouca-repita',
    gerador: 'aquecimento',
    params: { tipo: 'horizontal', escala: 'maior' },
    bpm: BPM,
    usaTom: true,
    formas: FORMAS,
    minutos: 2,
  },
];
