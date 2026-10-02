import { acorde, papelDaFuncao, type Qualidade } from './acordes';
import type { Marcador } from './marcador';
import { AFINACAO, CASA_MAX, croma, type ClasseNota, type Corda } from './notas';
import { FORMAS, voicing, type FormaCaged } from './voicings';

export interface Arpejo {
  fundamental: ClasseNota;
  qualidade: Qualidade;
  forma: FormaCaged;
  /** Janela de 5 casas da forma. */
  janela: [number, number];
  /** Notas da grave para a aguda. */
  marcadores: Marcador[];
}

/** Tríade que define a forma CAGED de cada qualidade (3ª maior → maior; 3ª menor → menor). */
function triadeDaForma(q: Qualidade): Qualidade {
  return q === '7M' || q === '7' || q === '' ? '' : 'm';
}

/**
 * Arpejo = acorde tocado nota por nota dentro da mesma forma (BLUEPRINT §3, Módulo 3).
 * A forma vem do acorde (tríade) da tônica; todas as notas do acorde na janela de 5 casas.
 */
export function arpejo(
  fundamental: ClasseNota,
  q: Qualidade,
  forma: FormaCaged,
  casaMin = 0,
): Arpejo {
  const info = acorde(fundamental, q);
  const porCroma = new Map(info.notas.map((n) => [croma(n.nota), n]));
  const v = voicing(fundamental, triadeDaForma(q), forma, { casaMin });
  const centro = (v.faixa[0] + v.faixa[1]) / 2;
  const lo = Math.max(0, Math.min(CASA_MAX - 4, Math.floor(centro - 2)));
  const janela: [number, number] = [lo, lo + 4];
  const marcadores: Marcador[] = [];
  for (const corda of [6, 5, 4, 3, 2, 1] as Corda[]) {
    for (let casa = janela[0]; casa <= janela[1]; casa++) {
      const midi = AFINACAO[corda] + casa;
      const n = porCroma.get(midi % 12);
      if (!n) continue;
      marcadores.push({
        corda,
        casa,
        midi,
        papel: papelDaFuncao(n.funcao),
        nota: n.nota,
        grau: n.grau,
        intervalo: n.nomeIntervalo,
      });
    }
  }
  marcadores.sort((a, b) => a.midi! - b.midi! || b.corda - a.corda);
  // Uníssono entre cordas: fica a da corda mais grave.
  const unicos = marcadores.filter((m, i) => i === 0 || m.midi !== marcadores[i - 1]!.midi);
  return { fundamental: info.fundamental, qualidade: q, forma, janela, marcadores: unicos };
}

/** As 5 formas ordenadas pela posição no braço (da mais grave para a mais aguda). */
export function formasEmOrdem(fundamental: ClasseNota, q: Qualidade): Arpejo[] {
  return FORMAS.map((f) => arpejo(fundamental, q, f)).sort((a, b) => a.janela[0] - b.janela[0]);
}

/** Arpejo (em qualquer forma) cuja janela fica mais perto de uma casa. */
export function arpejoNaRegiao(fundamental: ClasseNota, q: Qualidade, centro: number): Arpejo {
  const candidatos = FORMAS.flatMap((f) =>
    [0, 7].map((casaMin) => {
      try {
        return arpejo(fundamental, q, f, casaMin);
      } catch {
        return null;
      }
    }),
  ).filter((a): a is Arpejo => a !== null);
  const dist = (a: Arpejo) => Math.abs(a.janela[0] + 2 - centro);
  return candidatos.sort((a, b) => dist(a) - dist(b))[0]!;
}
