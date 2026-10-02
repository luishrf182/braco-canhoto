import type { ItemProgresso } from '../tipos';

export interface Requisito {
  modelos: string[];
  /** Formas exigidas (vazio = qualquer). */
  formas?: string[];
  /** Tons distintos com "Limpo" exigidos por modelo × forma. */
  minimoLimpos: number;
  /** Quantas combinações modelo × forma precisam cumprir (padrão: todas). */
  minimoModelos?: number;
}

export interface DefinicaoCheckpoint {
  requisitos: Requisito[];
}

export interface StatusCheckpoint {
  /** Metas exigidas. */
  total: number;
  /** Metas já cumpridas. */
  cumpridas: number;
  completo: boolean;
  /** Tons com Limpo por combinação (`modelo|forma`). */
  detalhe: Record<string, number>;
}

/** Checkpoint: cada requisito conta tons distintos com Limpo por modelo × forma. */
export function statusCheckpoint(
  def: DefinicaoCheckpoint,
  itens: Record<string, ItemProgresso>,
): StatusCheckpoint {
  const detalhe: Record<string, number> = {};
  let total = 0;
  let cumpridas = 0;
  for (const r of def.requisitos) {
    const formas = r.formas?.length ? r.formas : ['-'];
    const local: Record<string, number> = {};
    for (const m of r.modelos) for (const f of formas) local[`${m}|${f}`] = 0;
    for (const [chave, item] of Object.entries(itens)) {
      if (!(item.limpos ?? 0)) continue;
      const [modelo, , forma] = chave.split('|');
      const k = `${modelo}|${r.formas?.length ? forma : '-'}`;
      if (k in local) local[k] = (local[k] ?? 0) + 1;
    }
    const combos = Object.keys(local).length;
    const meta = Math.min(combos, r.minimoModelos ?? combos);
    const feitas = Object.values(local).filter((n) => n >= r.minimoLimpos).length;
    total += meta;
    cumpridas += Math.min(meta, feitas);
    Object.assign(detalhe, local);
  }
  return { total, cumpridas, completo: total > 0 && cumpridas === total, detalhe };
}
