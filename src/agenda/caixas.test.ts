import { describe, expect, it } from 'vitest';
import { aplicarAvaliacao, proximoBpm, somarDias } from './caixas';

const HOJE = '2026-03-10';
const AGORA = '2026-03-10T12:00:00.000Z';

describe('somarDias', () => {
  it('atravessa mês e ano', () => {
    expect(somarDias('2026-01-31', 1)).toBe('2026-02-01');
    expect(somarDias('2026-12-30', 7)).toBe('2027-01-06');
  });
});

describe('proximoBpm', () => {
  it('+4 após Limpo, −8 após Travou, igual após Quase', () => {
    expect(proximoBpm(80, 'limpo')).toBe(84);
    expect(proximoBpm(80, 'travou')).toBe(72);
    expect(proximoBpm(80, 'quase')).toBe(80);
    expect(proximoBpm(44, 'travou', 40)).toBe(40);
  });
});

describe('aplicarAvaliacao', () => {
  it('Limpo sobe uma caixa e agenda +3 / +7 dias', () => {
    const a = aplicarAvaliacao(undefined, 'limpo', HOJE, AGORA, 60);
    expect(a.caixa).toBe(2);
    expect(a.proximaRevisao).toBe('2026-03-13');
    expect(a.melhorBpm).toBe(60);
    expect(a.bpm).toBe(64);
    const b = aplicarAvaliacao(a, 'limpo', HOJE, AGORA, 64);
    expect(b.caixa).toBe(3);
    expect(b.proximaRevisao).toBe('2026-03-17');
    const c = aplicarAvaliacao(b, 'limpo', HOJE, AGORA, 68);
    expect(c.caixa).toBe(3);
    expect(c.melhorBpm).toBe(68);
  });

  it('Quase mantém a caixa e revisa amanhã', () => {
    const a = aplicarAvaliacao(undefined, 'limpo', HOJE, AGORA, 60);
    const q = aplicarAvaliacao(a, 'quase', HOJE, AGORA, 64);
    expect(q.caixa).toBe(2);
    expect(q.proximaRevisao).toBe('2026-03-11');
    expect(q.melhorBpm).toBe(60);
  });

  it('Travou volta à caixa 1 e revisa hoje, com −8 BPM', () => {
    const a = aplicarAvaliacao(undefined, 'limpo', HOJE, AGORA, 60);
    const t = aplicarAvaliacao(a, 'travou', HOJE, AGORA, 64);
    expect(t.caixa).toBe(1);
    expect(t.proximaRevisao).toBe(HOJE);
    expect(t.bpm).toBe(56);
    expect(t.vezes).toBe(2);
    expect(t.limpos).toBe(1);
  });
});
