import type { ModeloExercicio } from '../exercicios/tipos';
import { MAPA_DO_BRACO } from './treinos/mapa';

export interface Treino {
  id: string;
  titulo: string;
  descricao: string;
  modelos: ModeloExercicio[];
}

export const TREINOS: Treino[] = [
  {
    id: 'mapa',
    titulo: 'Mapa do braço',
    descricao: 'Nomes das notas, oitavas e a repetição depois da casa 12.',
    modelos: MAPA_DO_BRACO,
  },
];

export function todosModelos(): ModeloExercicio[] {
  return TREINOS.flatMap((t) => t.modelos);
}

export function buscarModelo(id: string): ModeloExercicio | undefined {
  return todosModelos().find((m) => m.id === id);
}
