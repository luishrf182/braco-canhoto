import { Note } from 'tonal';

/** Corda 1 = mi agudo, corda 6 = mi grave. */
export type Corda = 1 | 2 | 3 | 4 | 5 | 6;
export const CORDAS: Corda[] = [1, 2, 3, 4, 5, 6];

/** Classe de nota em notação inglesa, com acidente ASCII: 'C', 'F#', 'Bb'. */
export type ClasseNota = string;

/** Afinação padrão (MIDI das cordas soltas). */
export const AFINACAO: Record<Corda, number> = { 1: 64, 2: 59, 3: 55, 4: 50, 5: 45, 6: 40 };

export const CASA_MAX = 15;

export interface Nota {
  midi: number;
  /** 0..11, C = 0. */
  croma: number;
  /** Nome com sustenido por padrão ('C#'). */
  nome: ClasseNota;
}

export interface PosicaoBraco {
  corda: Corda;
  casa: number;
  midi: number;
  croma: number;
}

/** Os 12 tons, na grafia usual para tonalidade maior. */
export const TONS: ClasseNota[] = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

export function croma(nome: ClasseNota): number {
  const c = Note.chroma(nome);
  if (c === undefined || Number.isNaN(c)) throw new Error(`Nota inválida: ${nome}`);
  return c;
}

export function notaNa(corda: Corda, casa: number): Nota {
  const midi = AFINACAO[corda] + casa;
  return { midi, croma: midi % 12, nome: Note.pitchClass(Note.fromMidiSharps(midi)) };
}

export function posicao(corda: Corda, casa: number): PosicaoBraco {
  const midi = AFINACAO[corda] + casa;
  return { corda, casa, midi, croma: midi % 12 };
}

/** Todas as posições de uma classe de nota numa faixa de casas, da corda 6 para a 1. */
export function posicoesDe(
  classe: ClasseNota,
  faixa: [number, number] = [0, CASA_MAX],
): PosicaoBraco[] {
  const alvo = croma(classe);
  const res: PosicaoBraco[] = [];
  for (const corda of [6, 5, 4, 3, 2, 1] as Corda[]) {
    for (let casa = faixa[0]; casa <= faixa[1]; casa++) {
      if ((AFINACAO[corda] + casa) % 12 === alvo) res.push(posicao(corda, casa));
    }
  }
  return res;
}

/** Mesma classe de nota (enarmonia conta). */
export function mesmaClasse(a: ClasseNota, b: ClasseNota): boolean {
  return croma(a) === croma(b);
}

const SOLFEJO: Record<string, string> = {
  C: 'Dó',
  D: 'Ré',
  E: 'Mi',
  F: 'Fá',
  G: 'Sol',
  A: 'Lá',
  B: 'Si',
};

/** 'Bb' → 'B♭' (letras) ou 'Si♭' (dó-ré-mi). Aceita nome com oitava. */
export function formatarNota(nome: ClasseNota, sistema: 'letras' | 'do-re-mi' = 'letras'): string {
  const pc = Note.pitchClass(nome) || nome;
  const letra = pc.charAt(0).toUpperCase();
  const acidente = pc.slice(1).replace(/#/g, '♯').replace(/b/g, '♭');
  return (sistema === 'do-re-mi' ? (SOLFEJO[letra] ?? letra) : letra) + acidente;
}

/** Nome mais simples para uma classe arbitrária (para exibir notas soltas fora de contexto). */
export function nomeSimples(c: number, preferirBemol = false): ClasseNota {
  const sus = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const bem = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  return (preferirBemol ? bem : sus)[((c % 12) + 12) % 12]!;
}

/** Troca marcas `{n:Bb}` num texto pelo nome formatado da nota. */
export function formatarTexto(texto: string, sistema: 'letras' | 'do-re-mi' = 'letras'): string {
  return texto.replace(/\{n:([A-G][#b]*)\}/g, (_, n: string) => formatarNota(n, sistema));
}
