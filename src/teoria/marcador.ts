import type { Corda } from './notas';

/** Função da nota no contexto (define cor e formato no braço). */
export type Papel = 'fundamental' | '3' | '5' | '7' | 'extensao' | 'escala';

/** Ponto no braço, em coordenadas lógicas (sem espelho). */
export interface Marcador {
  corda: Corda;
  casa: number;
  papel: Papel;
  midi?: number;
  fantasma?: boolean;
  /** Nome da nota no contexto (ex.: 'Bb' num acorde de F). Sem ele, usa o nome com sustenido. */
  nota?: string;
  grau?: string;
  intervalo?: string;
  dedo?: number;
  /** Desenha o marcador sem rótulo (quiz "que nota é esta?"). */
  semRotulo?: boolean;
  /** Desenha como nota neutra (exceto a fundamental), para não entregar a resposta do quiz. */
  papelOculto?: boolean;
}
