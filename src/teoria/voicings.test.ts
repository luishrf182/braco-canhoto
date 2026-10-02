import { describe, expect, it } from 'vitest';
import { acorde, QUALIDADES_TETRADE, type Qualidade } from './acordes';
import { croma, notaNa, TONS } from './notas';
import { FORMAS, FORMAS_TETRADE, voicing, type FormaCaged } from './voicings';

/** "x32010" a partir da corda 6 → 1. */
function desenho(f: string, q: Qualidade, forma: FormaCaged, opc = {}) {
  const v = voicing(f, q, forma, opc);
  return ([6, 5, 4, 3, 2, 1] as const)
    .map((c) => {
      const p = v.posicoes.find((x) => x.corda === c);
      return p ? String(p.casa) : 'x';
    })
    .join(' ');
}

describe('tríades nas 5 formas (acordes abertos e pestanas conhecidas)', () => {
  it('formas abertas', () => {
    expect(desenho('C', '', 'C')).toBe('x 3 2 0 1 0');
    expect(desenho('A', '', 'A')).toBe('x 0 2 2 2 0');
    expect(desenho('G', '', 'G')).toBe('3 2 0 0 0 3');
    expect(desenho('E', '', 'E')).toBe('0 2 2 1 0 0');
    expect(desenho('D', '', 'D')).toBe('x x 0 2 3 2');
  });
  it('pestanas', () => {
    expect(desenho('F', '', 'E')).toBe('1 3 3 2 1 1');
    expect(desenho('G', 'm', 'E')).toBe('3 5 5 3 3 3');
    expect(desenho('B', 'm', 'A')).toBe('x 2 4 4 3 2');
    expect(desenho('C', '', 'A')).toBe('x 3 5 5 5 3');
    expect(desenho('D', '', 'C')).toBe('x 5 4 2 3 2');
  });
});

describe('tétrades — abertura 1 (formas de A e D)', () => {
  it('forma de A em C', () => {
    expect(desenho('C', '7M', 'A')).toBe('x 3 5 4 5 x');
    expect(desenho('C', '7', 'A')).toBe('x 3 5 3 5 x');
    expect(desenho('C', 'm7', 'A')).toBe('x 3 5 3 4 x');
    expect(desenho('C', 'm7(b5)', 'A')).toBe('x 3 4 3 4 x');
    expect(desenho('C', '°', 'A')).toBe('x 3 4 2 4 x');
  });
  it('forma de D', () => {
    expect(desenho('D', '7M', 'D')).toBe('x x 0 2 2 2');
    expect(desenho('D', '7', 'D')).toBe('x x 0 2 1 2');
    expect(desenho('D', 'm7', 'D')).toBe('x x 0 2 1 1');
    expect(desenho('C', '7M', 'D')).toBe('x x 10 12 12 12');
  });
  it('ordem real T-5-7-3 da corda grave para a aguda', () => {
    const v = voicing('C', '7M', 'A');
    const graus = v.posicoes.sort((a, b) => a.midi - b.midi).map((p) => p.funcao);
    expect(graus).toEqual(['1', '5', '7', '3']);
  });
});

describe('tétrades — abertura 2 (forma de E)', () => {
  it('forma de E em G, 5ª corda muda', () => {
    expect(desenho('G', '7M', 'E')).toBe('3 x 4 4 3 x');
    expect(desenho('G', '7', 'E')).toBe('3 x 3 4 3 x');
    expect(desenho('G', 'm7', 'E')).toBe('3 x 3 3 3 x');
    expect(desenho('G', 'm7(b5)', 'E')).toBe('3 x 3 3 2 x');
    expect(desenho('G', '°', 'E')).toBe('3 x 2 3 2 x');
  });
  it('ordem real T-7-3-5', () => {
    const v = voicing('A', 'm7', 'E');
    const graus = v.posicoes.sort((a, b) => a.midi - b.midi).map((p) => p.funcao);
    expect(graus).toEqual(['1', '7', '3', '5']);
  });
  it('não existe abertura 2 na forma de A nem tétrade nas formas C e G', () => {
    expect(() => voicing('C', '7M', 'A', { abertura: 2 })).toThrow();
    expect(() => voicing('C', '7M', 'C')).toThrow();
    expect(() => voicing('C', '7M', 'G')).toThrow();
  });
});

describe('propriedades: 5 qualidades × 12 tons × formas de tétrade', () => {
  it('notas certas, tônica no baixo, cabe na mão', () => {
    for (const { forma } of FORMAS_TETRADE) {
      for (const t of TONS) {
        for (const q of QUALIDADES_TETRADE) {
          const v = voicing(t, q, forma);
          const ac = acorde(t, q);
          const classes = new Set(ac.notas.map((n) => croma(n.nota)));
          const rot = `${t}${q} forma ${forma}`;
          expect(v.posicoes, rot).toHaveLength(4);
          for (const p of v.posicoes) {
            expect(notaNa(p.corda, p.casa).croma, rot).toBe(croma(p.nota));
            expect(classes.has(p.croma), rot).toBe(true);
          }
          expect(new Set(v.posicoes.map((p) => p.funcao)).size, rot).toBe(4);
          const baixo = v.posicoes.reduce((a, b) => (a.midi < b.midi ? a : b));
          expect(baixo.funcao, rot).toBe('1');
          expect(v.faixa[1] - v.faixa[0], rot).toBeLessThanOrEqual(4);
          expect(v.faixa[1], rot).toBeLessThanOrEqual(15);
        }
      }
    }
  });

  it('tríades maiores e menores nas 5 formas, 12 tons', () => {
    for (const forma of FORMAS) {
      for (const t of TONS) {
        for (const q of ['', 'm'] as Qualidade[]) {
          const v = voicing(t, q, forma);
          const classes = new Set(acorde(t, q).notas.map((n) => croma(n.nota)));
          const rot = `${t}${q} forma ${forma}`;
          expect(
            v.posicoes.every((p) => classes.has(p.croma)),
            rot,
          ).toBe(true);
          expect(v.faixa[1] - v.faixa[0], rot).toBeLessThanOrEqual(4);
        }
      }
    }
  });
});

describe('omissão e região', () => {
  it('sem a tônica grave', () => {
    expect(desenho('C', '7M', 'A', { omitir: ['1'] })).toBe('x x 5 4 5 x');
  });
  it('sem a quinta', () => {
    expect(desenho('G', '7', 'E', { omitir: ['5'] })).toBe('3 x 3 4 x x');
  });
  it('casaMin leva a forma para a outra região', () => {
    expect(desenho('F', '7M', 'E')).toBe('1 x 2 2 1 x');
    expect(desenho('F', '7M', 'E', { casaMin: 6 })).toBe('13 x 14 14 13 x');
  });
  it('se não couber depois de casaMin, volta para a região baixa', () => {
    expect(voicing('G', '7M', 'E', { casaMin: 6 }).faixa[0]).toBe(3);
  });
});
