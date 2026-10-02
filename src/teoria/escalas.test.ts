import { describe, expect, it } from 'vitest';
import { notasDaEscala, posicaoEscala, type TipoEscala } from './escalas';
import { croma, notaNa, TONS } from './notas';
import { FORMAS } from './voicings';

function desenho(tom: string, escala: TipoEscala, forma: Parameters<typeof posicaoEscala>[2]) {
  const p = posicaoEscala(tom, escala, forma);
  return ([6, 5, 4, 3, 2, 1] as const)
    .map((c) =>
      p.notas
        .filter((n) => n.corda === c)
        .map((n) => n.casa)
        .join(','),
    )
    .join(' ');
}

describe('notasDaEscala', () => {
  it('fatos conhecidos', () => {
    expect(notasDaEscala('A', 'penta-menor')).toEqual(['A', 'C', 'D', 'E', 'G']);
    expect(notasDaEscala('C', 'penta-maior')).toEqual(['C', 'D', 'E', 'G', 'A']);
    expect(notasDaEscala('F', 'maior')).toEqual(['F', 'G', 'A', 'Bb', 'C', 'D', 'E']);
  });
});

describe('posicaoEscala', () => {
  it('Lá menor pentatônica na forma de E: o "box 1" na casa 5', () => {
    expect(desenho('A', 'penta-menor', 'E')).toBe('5,8 5,7 5,7 5,7 5,8 5,8');
  });

  it('Lá menor pentatônica nas 5 formas (boxes 1 a 5)', () => {
    expect(desenho('A', 'penta-menor', 'D')).toBe('8,10 7,10 7,10 7,9 8,10 8,10');
    expect(desenho('A', 'penta-menor', 'C')).toBe('10,12 10,12 10,12 9,12 10,13 10,12');
    expect(desenho('A', 'penta-menor', 'A')).toBe('0,3 0,3 0,2 0,2 1,3 0,3');
    expect(desenho('A', 'penta-menor', 'G')).toBe('3,5 3,5 2,5 2,5 3,5 3,5');
  });

  it('Dó maior pentatônica na forma de D = box 3 de Lá menor', () => {
    expect(desenho('C', 'penta-maior', 'D')).toBe('10,12 10,12 10,12 9,12 10,13 10,12');
  });

  it('escala maior na forma de D: Dó em 9–13 e Sol em 4–8', () => {
    expect(posicaoEscala('C', 'maior', 'D').janela).toEqual([9, 13]);
    expect(posicaoEscala('G', 'maior', 'D').janela).toEqual([4, 8]);
    expect(desenho('G', 'maior', 'D').split(' ')[3]).toBe('4,5,7');
  });

  it('relativas compartilham a posição: Sol maior penta (forma de G) = Mi menor penta (forma de E)', () => {
    expect(desenho('G', 'penta-maior', 'G')).toBe(desenho('E', 'penta-menor', 'E'));
  });

  it('propriedades: 12 tons × 5 formas × 3 escalas', () => {
    for (const tom of TONS) {
      for (const forma of FORMAS) {
        for (const escala of ['maior', 'penta-maior', 'penta-menor'] as TipoEscala[]) {
          const p = posicaoEscala(tom, escala, forma);
          const rot = `${tom} ${escala} forma ${forma}`;
          const classes = new Set(notasDaEscala(tom, escala).map(croma));
          expect(p.janela[1] - p.janela[0], rot).toBe(4);
          for (const n of p.notas) {
            expect(classes.has(notaNa(n.corda, n.casa).croma), rot).toBe(true);
            expect(n.casa, rot).toBeGreaterThanOrEqual(p.janela[0]);
            expect(n.casa, rot).toBeLessThanOrEqual(p.janela[1]);
          }
          // Cobre pelo menos duas oitavas e passa pela tônica.
          const midis = p.notas.map((n) => n.midi);
          expect(Math.max(...midis) - Math.min(...midis), rot).toBeGreaterThanOrEqual(22);
          expect(p.notas.filter((n) => n.grau === 1).length, rot).toBeGreaterThanOrEqual(2);
          // Ordem crescente, sem uníssonos.
          for (let i = 1; i < midis.length; i++)
            expect(midis[i]!, rot).toBeGreaterThan(midis[i - 1]!);
          if (escala !== 'maior') {
            const porCorda = [1, 2, 3, 4, 5, 6].map(
              (c) => p.notas.filter((n) => n.corda === c).length,
            );
            expect(porCorda, rot).toEqual([2, 2, 2, 2, 2, 2]);
          }
        }
      }
    }
  });
});
