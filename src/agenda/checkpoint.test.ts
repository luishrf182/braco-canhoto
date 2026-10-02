import { describe, expect, it } from 'vitest';
import { statusCheckpoint } from './checkpoint';
import type { ItemProgresso } from '../tipos';

const limpo = (limpos = 1): ItemProgresso => ({
  caixa: 2,
  ultimaAvaliacao: 'limpo',
  proximaRevisao: '2026-01-01',
  atualizadoEm: '2026-01-01T00:00:00Z',
  limpos,
});

describe('statusCheckpoint', () => {
  const def = { modelos: ['a', 'b'], formas: ['E', 'A'], minimoLimpos: 2 };

  it('conta tons distintos com Limpo por modelo × forma', () => {
    const s = statusCheckpoint(def, {
      'a|C|E': limpo(),
      'a|G|E': limpo(),
      'a|C|A': limpo(),
      'b|C|E': { ...limpo(), limpos: 0, ultimaAvaliacao: 'travou' },
      'a|C|D': limpo(), // forma fora do checkpoint
    });
    expect(s.total).toBe(4);
    expect(s.detalhe['a|E']).toBe(2);
    expect(s.detalhe['a|A']).toBe(1);
    expect(s.detalhe['b|E']).toBe(0);
    expect(s.cumpridas).toBe(1);
    expect(s.completo).toBe(false);
  });

  it('completo quando tudo atinge o mínimo', () => {
    const itens: Record<string, ItemProgresso> = {};
    for (const m of ['a', 'b'])
      for (const f of ['E', 'A']) for (const t of ['C', 'G']) itens[`${m}|${t}|${f}`] = limpo();
    expect(statusCheckpoint(def, itens).completo).toBe(true);
  });

  it('sem formas, conta por modelo', () => {
    const s = statusCheckpoint({ modelos: ['x'], minimoLimpos: 1 }, { 'x|C|-': limpo() });
    expect(s.completo).toBe(true);
  });
});
