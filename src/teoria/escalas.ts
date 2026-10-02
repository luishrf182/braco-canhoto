import { Scale } from 'tonal';
import { AFINACAO, CASA_MAX, croma, type ClasseNota, type Corda } from './notas';
import { voicing, type FormaCaged } from './voicings';

export type TipoEscala = 'maior' | 'penta-maior' | 'penta-menor';

const NOME_TONAL: Record<TipoEscala, string> = {
  maior: 'major',
  'penta-maior': 'major pentatonic',
  'penta-menor': 'minor pentatonic',
};

export interface NotaEscala {
  corda: Corda;
  casa: number;
  midi: number;
  croma: number;
  nota: ClasseNota;
  /** Grau na escala, a partir de 1 (1 = tônica). */
  grau: number;
}

export interface PosicaoEscala {
  tom: ClasseNota;
  escala: TipoEscala;
  forma: FormaCaged;
  /** Janela de 5 casas da forma. */
  janela: [number, number];
  /** Notas da grave para a aguda. */
  notas: NotaEscala[];
}

export function notasDaEscala(tom: ClasseNota, escala: TipoEscala): ClasseNota[] {
  const s = Scale.get(`${tom} ${NOME_TONAL[escala]}`);
  if (s.empty) throw new Error(`Escala inválida: ${tom} ${escala}`);
  return s.notes;
}

/** Forma da penta menor de mesma digitação que a penta maior (relativa): G↔E, E↔D, D↔C, C↔A, A↔G. */
const FORMA_MENOR_DA_MAIOR: Record<FormaCaged, FormaCaged> = {
  G: 'E',
  E: 'D',
  D: 'C',
  C: 'A',
  A: 'G',
};

/** Grau (índice na penta menor) que começa na 6ª corda em cada forma: box 1 = E … box 5 = G. */
const INICIO_PENTA_MENOR: Record<FormaCaged, number> = { E: 0, D: 1, C: 2, A: 3, G: 4 };

/**
 * Pentatônica em 2 notas por corda: a 6ª corda começa no grau que define a forma, e cada corda
 * recebe as duas notas seguintes da escala. Gera os 5 "boxes" tradicionais.
 */
function pentatonica(tom: ClasseNota, escala: TipoEscala, forma: FormaCaged, casaMin: number) {
  const menor = escala === 'penta-menor' ? tom : relativaMenorDe(tom);
  const nomesMenor = notasDaEscala(menor, 'penta-menor');
  const nomesTom = notasDaEscala(tom, escala);
  const formaMenor = escala === 'penta-menor' ? forma : FORMA_MENOR_DA_MAIOR[forma];
  const inicio = INICIO_PENTA_MENOR[formaMenor];
  const cInicio = croma(nomesMenor[inicio]!);
  const base = (((cInicio - AFINACAO[6]) % 12) + 12) % 12;
  const tentar = (casa6: number): NotaEscala[] | null => {
    const res: NotaEscala[] = [];
    let midi = AFINACAO[6] + casa6;
    let k = inicio;
    for (const corda of [6, 5, 4, 3, 2, 1] as Corda[]) {
      for (let j = 0; j < 2; j++) {
        if (res.length) {
          // próxima nota da escala acima
          const prox = croma(nomesMenor[k % 5]!);
          while (midi % 12 !== prox) midi++;
        }
        const casa = midi - AFINACAO[corda];
        if (casa < 0 || casa > CASA_MAX) return null;
        const c = midi % 12;
        const i = nomesTom.map(croma).indexOf(c);
        res.push({ corda, casa, midi, croma: c, nota: nomesTom[i]!, grau: i + 1 });
        k++;
      }
    }
    return res;
  };
  for (let casa6 = base; casa6 <= CASA_MAX; casa6 += 12) {
    const r = tentar(casa6);
    if (r && Math.min(...r.map((n) => n.casa)) >= casaMin) return r;
  }
  for (let casa6 = base; casa6 <= CASA_MAX; casa6 += 12) {
    const r = tentar(casa6);
    if (r) return r;
  }
  throw new Error(`Pentatônica fora do braço: ${tom} ${escala} forma ${forma}`);
}

function relativaMenorDe(tom: ClasseNota): ClasseNota {
  return notasDaEscala(tom, 'maior')[5]!;
}

/**
 * Posição da escala dentro de uma forma CAGED.
 * Pentatônicas: 2 notas por corda (boxes tradicionais).
 * Escala maior: janela de 5 casas em torno do acorde maior da forma.
 */
export function posicaoEscala(
  tom: ClasseNota,
  escala: TipoEscala,
  forma: FormaCaged,
  casaMin = 0,
): PosicaoEscala {
  if (escala !== 'maior') {
    const notas = pentatonica(tom, escala, forma, casaMin);
    const lo = Math.min(...notas.map((n) => n.casa));
    return { tom, escala, forma, janela: [lo, lo + 4], notas };
  }
  const nomes = notasDaEscala(tom, escala);
  const cromas = nomes.map(croma);
  const v = voicing(tom, '', forma, { casaMin });
  const centro = (v.faixa[0] + v.faixa[1]) / 2;
  // floor: com centro em x,5 a janela fica do lado grave (desenho usual da forma de D).
  let lo = Math.floor(centro - 2);
  lo = Math.max(0, Math.min(CASA_MAX - 4, lo));
  const janela: [number, number] = [lo, lo + 4];
  const notas: NotaEscala[] = [];
  for (const corda of [6, 5, 4, 3, 2, 1] as Corda[]) {
    for (let casa = janela[0]; casa <= janela[1]; casa++) {
      const midi = AFINACAO[corda] + casa;
      const i = cromas.indexOf(midi % 12);
      if (i >= 0) notas.push({ corda, casa, midi, croma: midi % 12, nota: nomes[i]!, grau: i + 1 });
    }
  }
  // Ordem de altura; uníssono entre cordas (3ª–2ª): fica a da corda mais grave.
  notas.sort((a, b) => a.midi - b.midi || b.corda - a.corda);
  const unicas = notas.filter((n, i) => i === 0 || n.midi !== notas[i - 1]!.midi);
  return { tom, escala, forma, janela, notas: unicas };
}
