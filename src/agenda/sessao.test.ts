import { describe, expect, it } from 'vitest';
import { criarAleatorio } from '../exercicios/aleatorio';
import type { ItemProgresso } from '../tipos';
import { aplicarAvaliacao, somarDias } from './caixas';
import {
  duracao,
  intercalar,
  montarSessao,
  orcamento,
  revisoesPendentes,
  type EntradaSessao,
  type ModuloAgenda,
} from './sessao';

const MODULO: ModuloAgenda = {
  id: 'm1',
  licoes: [{ id: 'l1' }, { id: 'l2' }],
  modelos: [
    { id: 'a', formas: ['A', 'E'], usaTom: true, minutos: 2 },
    { id: 'b', formas: ['A', 'E'], usaTom: true, minutos: 2 },
    { id: 'c', usaTom: true, minutos: 2 },
  ],
  checkpointCompleto: false,
};
const AQUEC = [
  { id: 'q1', minutos: 2 },
  { id: 'q2', minutos: 2 },
  { id: 'q3', usaTom: true, minutos: 3 },
];

function entrada(p: Partial<EntradaSessao> = {}): EntradaSessao {
  return {
    modulos: [MODULO],
    aquecimentos: AQUEC,
    itens: {},
    licoesVistas: {},
    hoje: '2026-05-10',
    minutos: 20,
    rnd: criarAleatorio(3),
    ...p,
  };
}

const item = (proxima: string, caixa: 1 | 2 | 3 = 1, limpos = 1): ItemProgresso => ({
  caixa,
  ultimaAvaliacao: 'limpo',
  proximaRevisao: proxima,
  atualizadoEm: '2026-05-01T00:00:00Z',
  limpos,
});

describe('orcamento', () => {
  it('20 min = 4 + 8 + 8, e escala para 10 e 30', () => {
    expect(orcamento(20)).toEqual({ aquecimento: 4, novo: 8, revisao: 8 });
    expect(orcamento(10)).toEqual({ aquecimento: 2, novo: 4, revisao: 4 });
    expect(orcamento(30)).toEqual({ aquecimento: 6, novo: 12, revisao: 12 });
  });
});

describe('montarSessao', () => {
  it('primeiro dia: aquecimento + lição + conteúdo novo em C', () => {
    const s = montarSessao(entrada());
    expect(s[0]!.motivo).toBe('aquecimento');
    const novos = s.filter((i) => i.motivo === 'novo');
    expect(novos[0]).toMatchObject({ tipo: 'licao', licao: 'l1' });
    for (const n of novos) if (n.tipo === 'exercicio') expect(n.tom).toBe('C');
    expect(duracao(s)).toBeGreaterThanOrEqual(16);
    expect(duracao(s)).toBeLessThanOrEqual(24);
  });

  it('mistura aquecimento, novos e revisão quando há itens vencidos', () => {
    const itens = {
      'a|C|A': item('2026-05-09'),
      'a|C|E': item('2026-05-10', 2),
      'b|C|A': item('2026-05-08'),
      'c|C|-': item('2026-05-20'), // ainda não venceu
    };
    const s = montarSessao(entrada({ itens, licoesVistas: { 'm1/l1': 'x', 'm1/l2': 'x' } }));
    const motivos = new Set(s.map((i) => i.motivo));
    expect(motivos).toEqual(new Set(['aquecimento', 'novo', 'revisao']));
    const rev = s
      .filter((i) => i.motivo === 'revisao')
      .map((i) => (i.tipo === 'exercicio' ? `${i.modeloId}|${i.tom}|${i.forma}` : ''));
    expect(rev).toContain('b|C|A');
    expect(rev).not.toContain('c|C|-');
  });

  it('depois do primeiro Limpo em C, aparece variante em outro tom', () => {
    const itens: Record<string, ItemProgresso> = {};
    for (const m of ['a', 'b'])
      for (const f of ['A', 'E']) itens[`${m}|C|${f}`] = item('2026-06-01', 2);
    itens['c|C|-'] = item('2026-06-01', 2);
    const s = montarSessao(entrada({ itens, licoesVistas: { 'm1/l1': 'x', 'm1/l2': 'x' } }));
    const novos = s.filter((i) => i.motivo === 'novo' && i.tipo === 'exercicio');
    expect(novos.length).toBeGreaterThan(0);
    for (const n of novos) if (n.tipo === 'exercicio') expect(n.tom).not.toBe('C');
  });

  it('é determinística para a mesma semente', () => {
    expect(montarSessao(entrada({ rnd: criarAleatorio(9) }))).toEqual(
      montarSessao(entrada({ rnd: criarAleatorio(9) })),
    );
  });

  it('respeita 10 e 30 minutos', () => {
    const itens: Record<string, ItemProgresso> = {};
    for (let d = 0; d < 20; d++) itens[`a|T${d}|A`] = item('2026-05-01');
    const curta = montarSessao(entrada({ minutos: 10, itens }));
    const longa = montarSessao(entrada({ minutos: 30, itens }));
    expect(duracao(curta)).toBeLessThan(duracao(longa));
    expect(duracao(curta)).toBeLessThanOrEqual(14);
  });
});

describe('ciclo com datas simuladas', () => {
  it('Limpo some da agenda por 3 dias; Travou volta no mesmo dia; Quase volta amanhã', () => {
    const hoje = '2026-05-10';
    const conhecidos = new Set(['a']);
    const limpo = aplicarAvaliacao(undefined, 'limpo', hoje, 'x', 60);
    const travou = aplicarAvaliacao(undefined, 'travou', hoje, 'x', 60);
    const quase = aplicarAvaliacao(undefined, 'quase', hoje, 'x', 60);
    const itens = { 'a|C|A': limpo, 'a|G|A': travou, 'a|D|A': quase };
    expect(revisoesPendentes(itens, hoje, conhecidos)).toEqual(['a|G|A']);
    expect(revisoesPendentes(itens, somarDias(hoje, 1), conhecidos)).toEqual(['a|G|A', 'a|D|A']);
    expect(revisoesPendentes(itens, somarDias(hoje, 3), conhecidos)).toHaveLength(3);
  });
});

describe('intercalar', () => {
  it('evita o mesmo grupo seguido', () => {
    const r = intercalar(['a1', 'a2', 'a3', 'b1', 'c1'], (x) => x[0]!);
    for (let i = 1; i < r.length - 1; i++)
      expect(r[i]![0] === r[i - 1]![0] && r[i]![0] !== 'a').toBe(false);
    expect(r[0]).toBe('a1');
    expect(r[1]).toBe('b1');
  });
});

describe('lições', () => {
  it('no máximo uma lição nova por sessão, a primeira ainda não vista', () => {
    const s1 = montarSessao(entrada());
    expect(s1.filter((i) => i.tipo === 'licao')).toHaveLength(1);
    const s2 = montarSessao(entrada({ licoesVistas: { 'm1/l1': 'x' } }));
    expect(s2.find((i) => i.tipo === 'licao')).toMatchObject({ licao: 'l2' });
  });
});
