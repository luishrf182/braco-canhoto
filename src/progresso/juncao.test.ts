import { describe, expect, it } from 'vitest';
import { progressoPadrao, type ItemProgresso, type Progresso } from '../tipos';
import { juntar, mesmoConteudo } from './juncao';

const item = (atualizadoEm: string, caixa: 1 | 2 | 3 = 1): ItemProgresso => ({
  caixa,
  ultimaAvaliacao: 'limpo',
  proximaRevisao: '2026-01-10',
  atualizadoEm,
});

function com(p: Partial<Progresso>): Progresso {
  return { ...progressoPadrao(), ...p };
}

describe('juntar', () => {
  it('dois progressos divergentes resultam na união por atualizadoEm', () => {
    const celular = com({
      atualizadoEm: '2026-01-02T10:00:00Z',
      itens: {
        'a|C|A': item('2026-01-02T10:00:00Z', 2), // mais novo no celular
        'b|C|-': item('2026-01-01T09:00:00Z'), // só no celular
      },
    });
    const tablet = com({
      atualizadoEm: '2026-01-03T08:00:00Z',
      itens: {
        'a|C|A': item('2026-01-01T08:00:00Z', 1),
        'c|G|E': item('2026-01-03T08:00:00Z', 3), // só no tablet
      },
    });
    const j = juntar(celular, tablet);
    expect(Object.keys(j.itens).sort()).toEqual(['a|C|A', 'b|C|-', 'c|G|E']);
    expect(j.itens['a|C|A']!.caixa).toBe(2);
    expect(j.itens['c|G|E']!.caixa).toBe(3);
    expect(j.atualizadoEm).toBe('2026-01-03T08:00:00Z');
    expect(juntar(tablet, celular).itens).toEqual(j.itens);
  });

  it('ajustes: vence o mais recente inteiro', () => {
    const a = com({});
    a.ajustes = { ...a.ajustes, tema: 'escuro', atualizadoEm: '2026-01-05T00:00:00Z' };
    const b = com({});
    b.ajustes = { ...b.ajustes, tema: 'claro', atualizadoEm: '2026-01-04T00:00:00Z' };
    expect(juntar(a, b).ajustes.tema).toBe('escuro');
    expect(juntar(b, a).ajustes.tema).toBe('escuro');
  });

  it('sessões: união por id, ordenada, no máximo 60', () => {
    const s = (id: string, data: string, n = 0) => ({
      id,
      data,
      minutos: 20,
      itens: Array.from({ length: n }, () => ({ chave: 'x', avaliacao: 'limpo' as const })),
    });
    const a = com({ sessoes: [s('1', '2026-01-01', 2), s('2', '2026-01-02')] });
    const b = com({ sessoes: [s('1', '2026-01-01', 5), s('3', '2026-01-03')] });
    const j = juntar(a, b);
    expect(j.sessoes.map((x) => x.id)).toEqual(['1', '2', '3']);
    expect(j.sessoes[0]!.itens).toHaveLength(5);
    const muitas = com({
      sessoes: Array.from({ length: 70 }, (_, i) => s(String(i).padStart(3, '0'), '2026-01-01')),
    });
    expect(juntar(muitas, com({})).sessoes).toHaveLength(60);
  });

  it('lições vistas: união, guardando a primeira data', () => {
    const a = com({ licoesVistas: { 'm/l1': '2026-01-05', 'm/l2': '2026-01-01' } });
    const b = com({ licoesVistas: { 'm/l1': '2026-01-02', 'm/l3': '2026-01-03' } });
    expect(juntar(a, b).licoesVistas).toEqual({
      'm/l1': '2026-01-02',
      'm/l2': '2026-01-01',
      'm/l3': '2026-01-03',
    });
  });

  it('juntar consigo mesmo não muda nada', () => {
    const p = com({ itens: { 'a|C|A': item('2026-01-02T00:00:00Z') }, licoesVistas: {} });
    expect(mesmoConteudo(juntar(p, p), p)).toBe(true);
  });
});
