import type { ModeloExercicio } from '../exercicios/tipos';
import type { Funcao, Qualidade } from '../teoria/acordes';
import type { Abertura, FormaCaged } from '../teoria/voicings';
import type { ModuloId } from '../tipos';
import type { Requisito } from '../agenda/checkpoint';

/** Exemplo musical de uma tela de conceito. Os dados vêm sempre do motor. */
export type ExemploConceito =
  | {
      tipo: 'voicing';
      tom: string;
      qualidade: Qualidade;
      forma: FormaCaged;
      abertura?: Abertura;
      omitir?: Funcao[];
    }
  | { tipo: 'notas-acorde'; tom: string; qualidade: Qualidade }
  | { tipo: 'campo'; tom: string }
  | { tipo: 'cadencia'; tom: string; graus: string[] }
  | { tipo: 'arpejo'; tom: string; qualidade: Qualidade; forma: FormaCaged }
  | { tipo: 'conexao'; tom: string; qualidade: Qualidade; formas: FormaCaged[] };

export interface TelaConceito {
  /** No máximo 2 frases. Pode usar {n:Bb} para nomes de nota. */
  texto: string;
  exemplo?: ExemploConceito;
}

export interface Licao {
  id: string;
  titulo: string;
  telas: TelaConceito[];
}

export interface Checkpoint {
  requisitos: Requisito[];
  descricao: string;
}

export interface Modulo {
  id: ModuloId;
  titulo: string;
  descricao: string;
  licoes: Licao[];
  modelos: ModeloExercicio[];
  checkpoint: Checkpoint;
}
