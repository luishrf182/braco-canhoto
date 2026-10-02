import {
  AFINACAO,
  CASA_MAX,
  croma,
  type ClasseNota,
  type Corda,
  posicao,
  type PosicaoBraco,
} from './notas';

export interface PadraoOitava {
  id: string;
  /** Corda da nota grave → corda da nota aguda. */
  de: Corda;
  para: Corda;
  /** Deslocamento de casas da nota grave para a aguda. */
  deslocamento: number;
  nome: string;
}

/**
 * Pares de cordas que formam uma oitava com as duas notas a no máximo 3 casas de distância
 * (saltando 1 ou 2 cordas). Calculado a partir da afinação, não escrito à mão.
 */
export const PADROES_OITAVA: PadraoOitava[] = (() => {
  const res: PadraoOitava[] = [];
  for (const de of [6, 5, 4, 3] as Corda[]) {
    for (const salto of [2, 3]) {
      const para = (de - salto) as Corda;
      if (para < 1) continue;
      const deslocamento = AFINACAO[de] + 12 - AFINACAO[para];
      if (Math.abs(deslocamento) > 3) continue;
      res.push({
        id: `${de}-${para}`,
        de,
        para,
        deslocamento,
        nome: `${de}ª → ${para}ª corda (${deslocamento > 0 ? '+' : ''}${deslocamento} casas)`,
      });
    }
  }
  return res;
})();

/**
 * Para uma classe de nota, devolve cada ocorrência de cada padrão de oitava dentro de 0–15:
 * uma lista de pares [grave, aguda].
 */
export function padroesOitava(
  classe: ClasseNota,
): { padrao: PadraoOitava; notas: PosicaoBraco[] }[] {
  const alvo = croma(classe);
  const res: { padrao: PadraoOitava; notas: PosicaoBraco[] }[] = [];
  for (const p of PADROES_OITAVA) {
    for (let casa = 0; casa <= CASA_MAX; casa++) {
      if ((AFINACAO[p.de] + casa) % 12 !== alvo) continue;
      const casaAguda = casa + p.deslocamento;
      if (casaAguda < 0 || casaAguda > CASA_MAX) continue;
      res.push({ padrao: p, notas: [posicao(p.de, casa), posicao(p.para, casaAguda)] });
    }
  }
  return res;
}
