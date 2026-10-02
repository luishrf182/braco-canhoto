import type { ModeloExercicio } from '../exercicios/tipos';
import type { ModuloId } from '../tipos';
import { CAMPO_MAIOR } from './modulos/campo-maior';
import { TETRADES } from './modulos/tetrades';
import type { Licao, Modulo } from './tipos';
import { AQUECIMENTOS_TECNICOS } from './treinos/aquecimentos';
import { MAPA_DO_BRACO } from './treinos/mapa';

export interface Treino {
  id: string;
  titulo: string;
  descricao: string;
  modelos: ModeloExercicio[];
}

export const MODULOS: Modulo[] = [TETRADES, CAMPO_MAIOR];

export const TREINOS: Treino[] = [
  {
    id: 'mapa',
    titulo: 'Mapa do braço',
    descricao: 'Nomes das notas, oitavas e a repetição depois da casa 12.',
    modelos: MAPA_DO_BRACO,
  },
  {
    id: 'aquecimentos',
    titulo: 'Aquecimentos',
    descricao: 'Padrões técnicos em qualquer tom e forma, com 3 variações rítmicas.',
    modelos: AQUECIMENTOS_TECNICOS,
  },
];

/** Aquecimentos da Sessão do dia: técnicos + quizzes rápidos do Mapa do braço. */
export const AQUECIMENTOS: ModeloExercicio[] = [
  ...AQUECIMENTOS_TECNICOS,
  ...MAPA_DO_BRACO.filter((m) => m.id === 'mapa-nome-ponto' || m.id === 'mapa-tocar-nota'),
];

export function todosModelos(): ModeloExercicio[] {
  return [...MODULOS.flatMap((m) => m.modelos), ...TREINOS.flatMap((t) => t.modelos)];
}

export function buscarModelo(id: string): ModeloExercicio | undefined {
  return todosModelos().find((m) => m.id === id);
}

export function buscarModulo(id: string): Modulo | undefined {
  return MODULOS.find((m) => m.id === (id as ModuloId));
}

export function buscarLicao(modulo: string, licao: string): Licao | undefined {
  return buscarModulo(modulo)?.licoes.find((l) => l.id === licao);
}

/** Módulo ao qual um modelo pertence (para "conteúdo novo"). */
export function moduloDoModelo(modeloId: string): Modulo | undefined {
  return MODULOS.find((m) => m.modelos.some((x) => x.id === modeloId));
}
