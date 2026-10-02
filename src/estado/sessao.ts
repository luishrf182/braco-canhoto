import { statusCheckpoint } from '../agenda/checkpoint';
import { hojeISO } from '../agenda/caixas';
import { montarSessao, type ItemSessao } from '../agenda/sessao';
import { AQUECIMENTOS, MODULOS, buscarLicao, buscarModelo } from '../conteudo';
import { criarAleatorio } from '../exercicios/aleatorio';
import { formatarNota } from '../teoria/notas';
import type { Progresso } from '../tipos';

/** Semente estável por dia: a sessão de hoje não muda a cada recarga. */
export function sementeDoDia(hoje: string, n = 0): number {
  let h = 2166136261;
  for (const c of hoje + ':' + n) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

export function planejarSessao(p: Progresso, agora = new Date(), n = 0): ItemSessao[] {
  const hoje = hojeISO(agora);
  return montarSessao({
    modulos: MODULOS.map((m) => ({
      id: m.id,
      licoes: m.licoes.map((l) => ({
        id: l.id,
        minutos: Math.max(1, Math.ceil(l.telas.length * 0.7)),
      })),
      modelos: m.modelos,
      checkpointCompleto: statusCheckpoint(m.checkpoint, p.itens).completo,
    })),
    aquecimentos: AQUECIMENTOS,
    itens: p.itens,
    licoesVistas: p.licoesVistas ?? {},
    hoje,
    minutos: p.ajustes.sessaoMinutos,
    rnd: criarAleatorio(sementeDoDia(hoje, n)),
  });
}

/** Título legível de um item da sessão. */
export function tituloItem(i: ItemSessao, sistema: 'letras' | 'do-re-mi' = 'letras'): string {
  if (i.tipo === 'licao') return `Lição: ${buscarLicao(i.modulo, i.licao)?.titulo ?? i.licao}`;
  const m = buscarModelo(i.modeloId);
  const partes = [m?.titulo ?? i.modeloId];
  if (i.tom !== '-') partes.push(formatarNota(i.tom, sistema));
  if (i.forma !== '-') partes.push(`forma de ${i.forma}`);
  return partes.join(' · ');
}

export const ROTULO_MOTIVO: Record<ItemSessao['motivo'], string> = {
  aquecimento: 'Aquecimento',
  novo: 'Novo',
  revisao: 'Revisão',
};
