import { Interval, Note, Scale } from 'tonal';
import { acorde, comBaixo, type AcordeInfo, type Qualidade } from './acordes';
import type { ClasseNota } from './notas';

export const GRAUS_ROMANOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'] as const;
export type Romano = (typeof GRAUS_ROMANOS)[number];

export type Funcao = 'tônica' | 'subdominante' | 'dominante';

/** Função harmônica de cada grau (tônica: I, III, VI; subdominante: II, IV; dominante: V, VII). */
export const FUNCAO_DO_GRAU: Record<Romano, Funcao> = {
  I: 'tônica',
  II: 'subdominante',
  III: 'tônica',
  IV: 'subdominante',
  V: 'dominante',
  VI: 'tônica',
  VII: 'dominante',
};

export function escalaMaior(tom: ClasseNota): ClasseNota[] {
  const s = Scale.get(`${tom} major`);
  if (s.empty) throw new Error(`Tom inválido: ${tom}`);
  return s.notes;
}

/** Identifica a qualidade a partir das distâncias (em semitons) empilhadas sobre a tônica. */
function qualidadeDe(semitons: number[]): Qualidade {
  const k = semitons.join(',');
  const mapa: Record<string, Qualidade> = {
    '4,7': '',
    '3,7': 'm',
    '3,6': 'm(b5)',
    '4,7,11': '7M',
    '4,7,10': '7',
    '3,7,10': 'm7',
    '3,6,10': 'm7(b5)',
    '3,6,9': '°',
  };
  const q = mapa[k];
  if (q === undefined) throw new Error(`Qualidade não reconhecida: ${k}`);
  return q;
}

export interface GrauDoCampo {
  romano: Romano;
  /** Rótulo do grau no padrão brasileiro: I7M, IIm7, VIIm7(b5) (ou I, IIm, VIIm(b5) em tríades). */
  rotulo: string;
  acorde: AcordeInfo;
  funcao: Funcao;
}

/** Campo harmônico maior por empilhamento de terças sobre a escala. */
export function campoHarmonico(tom: ClasseNota, tipo: 'triade' | 'tetrade'): GrauDoCampo[] {
  const escala = escalaMaior(tom);
  const n = tipo === 'tetrade' ? 4 : 3;
  return escala.map((raiz, i) => {
    const notas = Array.from({ length: n }, (_, k) => escala[(i + 2 * k) % 7]!);
    const semitons = notas
      .slice(1)
      .map((x) => ((Interval.semitones(Interval.distance(raiz, x)) ?? 0) + 12) % 12);
    const q = qualidadeDe(semitons);
    const romano = GRAUS_ROMANOS[i]!;
    return {
      romano,
      rotulo: rotuloGrau(romano, q),
      acorde: acorde(raiz, q),
      funcao: FUNCAO_DO_GRAU[romano],
    };
  });
}

/** I + 7M → "I7M"; II + m7 → "IIm7"; VII + m(b5) → "VIIm(b5)". */
export function rotuloGrau(romano: string, q: Qualidade): string {
  return romano + q;
}

/**
 * Cadência por graus (notação do material: I, V, VIm, IIIm, V/3, V7/VI).
 * Cada grau vira a tétrade do campo; "/3" põe a 3ª no baixo; "V7/X" é a dominante do grau X.
 */
export function cadencia(tom: ClasseNota, graus: string[], tipo: 'triade' | 'tetrade' = 'tetrade') {
  const campo = campoHarmonico(tom, tipo);
  const porRomano = new Map(campo.map((g) => [g.romano, g]));
  return graus.map((g) => {
    const sec = /^V7?\/(I{1,3}|IV|VI{0,2})m?$/.exec(g);
    if (sec) {
      const alvo = porRomano.get(sec[1] as Romano);
      if (!alvo) throw new Error(`Grau inválido: ${g}`);
      const raiz = Note.pitchClass(Note.transpose(alvo.acorde.fundamental, '5P'));
      // "V7" pede a 7ª mesmo no modo tríade.
      return { grau: g, acorde: acorde(raiz, '7') };
    }
    const inv = /^(.+)\/3$/.exec(g);
    const base = (inv ? inv[1] : g)!.replace(/m7?\(b5\)|m7?|7M|7|°|dim/g, '');
    const grau = porRomano.get(base as Romano);
    if (!grau) throw new Error(`Grau inválido: ${g}`);
    const ac = grau.acorde;
    return { grau: g, acorde: inv ? comBaixo(ac, ac.notas[1]!.nota) : ac };
  });
}

/** Relativa menor de um tom maior (VI grau) e vice-versa. */
export function relativaMenor(tom: ClasseNota): ClasseNota {
  return escalaMaior(tom)[5]!;
}

export function relativaMaior(menor: ClasseNota): ClasseNota {
  return Note.pitchClass(Note.transpose(menor, '3m'));
}
