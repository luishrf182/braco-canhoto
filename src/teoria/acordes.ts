import { Chord, Interval, Note } from 'tonal';
import { croma, type ClasseNota } from './notas';
import type { Papel } from './marcador';

export type Qualidade = '7M' | '7' | 'm7' | 'm7(b5)' | '°' | '' | 'm' | 'm(b5)';

export const QUALIDADES_TETRADE: Qualidade[] = ['7M', '7', 'm7', 'm7(b5)', '°'];

const TIPO_TONAL: Record<Qualidade, string> = {
  '7M': 'maj7',
  '7': '7',
  m7: 'm7',
  'm7(b5)': 'm7b5',
  '°': 'dim7',
  '': 'M',
  m: 'm',
  'm(b5)': 'dim',
};

/** Grau dentro do acorde, como aparece nos rótulos: T, 3, b3, 5, b5, 7M, 7, bb7. */
export type Grau = 'T' | '3' | 'b3' | '5' | 'b5' | '#5' | '7M' | '7' | 'bb7';

/** Função genérica do grau (1, 3, 5 ou 7), usada pelas formas e pela omissão. */
export type Funcao = '1' | '3' | '5' | '7';

const GRAU_DO_INTERVALO: Record<string, Grau> = {
  '1P': 'T',
  '3M': '3',
  '3m': 'b3',
  '5P': '5',
  '5d': 'b5',
  '5A': '#5',
  '7M': '7M',
  '7m': '7',
  '7d': 'bb7',
};

const NOME_INTERVALO: Record<string, string> = {
  '1P': '1J',
  '3M': '3M',
  '3m': '3m',
  '5P': '5J',
  '5d': '5d',
  '5A': '5A',
  '7M': '7M',
  '7m': '7m',
  '7d': '7d',
};

export interface NotaDoAcorde {
  nota: ClasseNota;
  intervalo: string;
  /** Distância em semitons da tônica (0–11). */
  semitons: number;
  grau: Grau;
  funcao: Funcao;
  /** Rótulo curto do intervalo para o braço: 1J, 3M, 3m, 5J, 5d, 7M, 7m, 7d. */
  nomeIntervalo: string;
}

export interface AcordeInfo {
  fundamental: ClasseNota;
  qualidade: Qualidade;
  notas: NotaDoAcorde[];
  /** Baixo diferente da fundamental (inversão, ex.: V/3). */
  baixo?: ClasseNota;
}

export function acorde(fundamental: ClasseNota, qualidade: Qualidade): AcordeInfo {
  const c = Chord.getChord(TIPO_TONAL[qualidade], fundamental);
  if (c.empty) throw new Error(`Acorde inválido: ${fundamental}${qualidade}`);
  const notas = c.intervals.map((iv, i): NotaDoAcorde => {
    const grau = GRAU_DO_INTERVALO[iv];
    if (!grau) throw new Error(`Intervalo inesperado: ${iv}`);
    return {
      nota: c.notes[i]!,
      intervalo: iv,
      semitons: ((Interval.semitones(iv) ?? 0) + 12) % 12,
      grau,
      funcao: iv.charAt(0) as Funcao,
      nomeIntervalo: NOME_INTERVALO[iv] ?? iv,
    };
  });
  return { fundamental: Note.pitchClass(fundamental), qualidade, notas };
}

export function papelDaFuncao(f: Funcao): Papel {
  return f === '1' ? 'fundamental' : (f as Papel);
}

/** A nota do acorde que corresponde a uma classe (croma), se houver. */
export function notaDoAcordePorCroma(a: AcordeInfo, c: number): NotaDoAcorde | undefined {
  return a.notas.find((n) => croma(n.nota) === c);
}

export function comBaixo(a: AcordeInfo, baixo: ClasseNota): AcordeInfo {
  return { ...a, baixo };
}
