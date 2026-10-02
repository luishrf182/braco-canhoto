import { describe, expect, it } from 'vitest';
import { PADROES_OITAVA, padroesOitava } from './oitavas';

describe('padrões de oitava', () => {
  it('são os pares conhecidos da afinação padrão', () => {
    const m = Object.fromEntries(PADROES_OITAVA.map((p) => [p.id, p.deslocamento]));
    expect(m).toEqual({
      '6-4': 2,
      '6-3': -3,
      '5-3': 2,
      '5-2': -2,
      '4-2': 3,
      '4-1': -2,
      '3-1': 3,
    });
  });

  it('cada par soa exatamente uma oitava acima', () => {
    for (const { notas } of padroesOitava('G')) {
      expect(notas[1]!.midi - notas[0]!.midi).toBe(12);
      expect(notas.every((n) => n.croma === 7)).toBe(true);
    }
  });

  it('Lá na 6ª corda casa 5 → 4ª corda casa 7', () => {
    const a = padroesOitava('A').find((p) => p.padrao.id === '6-4' && p.notas[0]!.casa === 5);
    expect(a?.notas[1]).toMatchObject({ corda: 4, casa: 7 });
  });
});
