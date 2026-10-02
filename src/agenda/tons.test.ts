import { describe, expect, it } from 'vitest';
import { criarAleatorio } from '../exercicios/aleatorio';
import { sortearTom, TONS_FAVORITOS } from './tons';

describe('sortearTom', () => {
  it('favorece C, G, D, A, E, F e B♭', () => {
    const rnd = criarAleatorio(42);
    const contagem: Record<string, number> = {};
    for (let i = 0; i < 5000; i++) {
      const t = sortearTom(rnd);
      contagem[t] = (contagem[t] ?? 0) + 1;
    }
    const fav = TONS_FAVORITOS.reduce((s, t) => s + (contagem[t] ?? 0), 0) / 5000;
    // 7×3 / (7×3 + 5×1) = 21/26 ≈ 0,81
    expect(fav).toBeGreaterThan(0.75);
    expect(fav).toBeLessThan(0.87);
    expect(Object.keys(contagem)).toHaveLength(12);
  });

  it('respeita a exclusão', () => {
    const rnd = criarAleatorio(1);
    for (let i = 0; i < 200; i++) expect(sortearTom(rnd, ['C', 'G'])).not.toMatch(/^(C|G)$/);
  });
});
