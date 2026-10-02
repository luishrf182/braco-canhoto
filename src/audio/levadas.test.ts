import { describe, expect, it } from 'vitest';
import { LEVADAS, NOMES_LEVADA, toques } from './levadas';

describe('levadas', () => {
  it('toda linha tem 16 passos e só usa x, o e .', () => {
    for (const n of NOMES_LEVADA) {
      const l = LEVADAS[n];
      for (const linha of [l.bumbo, l.caixa, l.chimbal, l.baixo]) {
        expect(linha, n).toHaveLength(16);
        expect(linha, n).toMatch(/^[xo.]+$/);
      }
    }
  });

  it('caixa forte nos tempos 2 e 4, bumbo no tempo 1', () => {
    for (const n of NOMES_LEVADA) {
      const l = LEVADAS[n];
      const caixa = toques(l.caixa)
        .filter((t) => t.forca === 1)
        .map((t) => t.passo);
      expect(caixa, n).toEqual([4, 12]);
      expect(l.bumbo[0], n).toBe('x');
      expect(l.baixo[0], n).toBe('x');
    }
  });

  it('toques converte forte e fraco', () => {
    expect(toques('x.o.')).toEqual([
      { passo: 0, forca: 1 },
      { passo: 2, forca: 0.45 },
    ]);
  });
});
