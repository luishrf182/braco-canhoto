import type { Avaliacao, Caixa, ItemProgresso } from '../tipos';

/** Intervalo de revisão por caixa após um "Limpo". */
export const DIAS_POR_CAIXA: Record<Caixa, number> = { 1: 1, 2: 3, 3: 7 };

export const PASSO_BPM = 4;
export const RECUO_BPM = 8;

/** Soma dias a uma data AAAA-MM-DD (em UTC, sem fuso). */
export function somarDias(data: string, dias: number): string {
  const d = new Date(data + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

export function hojeISO(agora: Date): string {
  // Data local do aparelho, não UTC.
  const a = agora.getFullYear();
  const m = String(agora.getMonth() + 1).padStart(2, '0');
  const d = String(agora.getDate()).padStart(2, '0');
  return `${a}-${m}-${d}`;
}

/** BPM da próxima vez: +4 após Limpo, −8 após Travou, igual após Quase. */
export function proximoBpm(bpm: number, avaliacao: Avaliacao, minimo = 40): number {
  if (avaliacao === 'limpo') return bpm + PASSO_BPM;
  if (avaliacao === 'travou') return Math.max(minimo, bpm - RECUO_BPM);
  return bpm;
}

/**
 * Regras da agenda (BLUEPRINT §7.4):
 * Limpo → sobe uma caixa; revisão em +1, +3 ou +7 dias conforme a nova caixa.
 * Quase → mantém a caixa; revisão em +1 dia.
 * Travou → volta para a caixa 1; revisão na próxima sessão (hoje).
 */
export function aplicarAvaliacao(
  anterior: ItemProgresso | undefined,
  avaliacao: Avaliacao,
  hoje: string,
  agoraISO: string,
  bpm?: number,
): ItemProgresso {
  const caixaAnterior: Caixa = anterior?.caixa ?? 1;
  let caixa: Caixa;
  let proximaRevisao: string;
  if (avaliacao === 'limpo') {
    caixa = Math.min(3, caixaAnterior + 1) as Caixa;
    proximaRevisao = somarDias(hoje, DIAS_POR_CAIXA[caixa]);
  } else if (avaliacao === 'quase') {
    caixa = caixaAnterior;
    proximaRevisao = somarDias(hoje, 1);
  } else {
    caixa = 1;
    proximaRevisao = hoje;
  }
  const melhorBpm =
    avaliacao === 'limpo' && bpm !== undefined
      ? Math.max(bpm, anterior?.melhorBpm ?? 0)
      : anterior?.melhorBpm;
  const item: ItemProgresso = {
    caixa,
    ultimaAvaliacao: avaliacao,
    proximaRevisao,
    atualizadoEm: agoraISO,
    vezes: (anterior?.vezes ?? 0) + 1,
    limpos: (anterior?.limpos ?? 0) + (avaliacao === 'limpo' ? 1 : 0),
  };
  if (melhorBpm !== undefined) item.melhorBpm = melhorBpm;
  if (bpm !== undefined) item.bpm = proximoBpm(bpm, avaliacao);
  else if (anterior?.bpm !== undefined) item.bpm = anterior.bpm;
  return item;
}

/** Dias de `de` até `ate` (datas AAAA-MM-DD). */
export function diasEntre(de: string, ate: string): number {
  const ms = Date.parse(ate + 'T00:00:00Z') - Date.parse(de + 'T00:00:00Z');
  return Math.round(ms / 86400000);
}

/** "na próxima sessão", "amanhã", "em 3 dias". */
export function textoRevisao(proximaRevisao: string, hoje: string): string {
  const d = diasEntre(hoje, proximaRevisao);
  if (d <= 0) return 'na próxima sessão';
  if (d === 1) return 'amanhã';
  return `em ${d} dias`;
}
