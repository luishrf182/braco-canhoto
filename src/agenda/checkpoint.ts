import type { ItemProgresso } from '../tipos';

export interface DefinicaoCheckpoint {
  modelos: string[];
  formas?: string[];
  minimoLimpos: number;
}

export interface StatusCheckpoint {
  /** Combinações modelo × forma exigidas. */
  total: number;
  /** Combinações que já atingiram o mínimo de tons com Limpo. */
  cumpridas: number;
  completo: boolean;
  /** Tons com Limpo por combinação (`modelo|forma`). */
  detalhe: Record<string, number>;
}

/** Checkpoint: cada modelo × forma precisa de Limpo em `minimoLimpos` tons distintos. */
export function statusCheckpoint(
  def: DefinicaoCheckpoint,
  itens: Record<string, ItemProgresso>,
): StatusCheckpoint {
  const formas = def.formas?.length ? def.formas : ['-'];
  const detalhe: Record<string, number> = {};
  for (const m of def.modelos) for (const f of formas) detalhe[`${m}|${f}`] = 0;
  for (const [chave, item] of Object.entries(itens)) {
    if (!(item.limpos ?? 0)) continue;
    const [modelo, , forma] = chave.split('|');
    const k = `${modelo}|${def.formas?.length ? forma : '-'}`;
    if (k in detalhe) detalhe[k] = (detalhe[k] ?? 0) + 1;
  }
  const total = Object.keys(detalhe).length;
  const cumpridas = Object.values(detalhe).filter((n) => n >= def.minimoLimpos).length;
  return { total, cumpridas, completo: total > 0 && cumpridas === total, detalhe };
}
