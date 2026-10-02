import { describe, expect, it } from 'vitest';
import { formatarNota, notaNa, posicoesDe, croma, TONS, type Corda } from './notas';

describe('notaNa', () => {
  it('cordas soltas na afinação padrão', () => {
    const soltas = ([1, 2, 3, 4, 5, 6] as Corda[]).map((c) => notaNa(c, 0).nome);
    expect(soltas).toEqual(['E', 'B', 'G', 'D', 'A', 'E']);
    expect(notaNa(6, 0).midi).toBe(40); // E2
    expect(notaNa(1, 0).midi).toBe(64); // E4
  });

  it('casa 12 repete a corda solta uma oitava acima', () => {
    for (const c of [1, 2, 3, 4, 5, 6] as Corda[]) {
      expect(notaNa(c, 12).nome).toBe(notaNa(c, 0).nome);
      expect(notaNa(c, 12).midi).toBe(notaNa(c, 0).midi + 12);
    }
  });

  it('fatos conhecidos', () => {
    expect(notaNa(6, 3).nome).toBe('G');
    expect(notaNa(5, 3).nome).toBe('C');
    expect(notaNa(6, 5).nome).toBe('A'); // referência de afinação
    expect(notaNa(2, 1).nome).toBe('C');
    expect(notaNa(3, 2).nome).toBe('A');
    expect(notaNa(4, 7).nome).toBe('A');
    expect(notaNa(3, 4).midi).toBe(notaNa(2, 0).midi); // única terça maior entre cordas
  });
});

describe('posicoesDe', () => {
  it('Dó de 0 a 15 aparece 2 vezes em cada corda, exceto onde cabe 1', () => {
    const c = posicoesDe('C');
    expect(c.every((p) => p.croma === 0)).toBe(true);
    const porCorda = (k: number) => c.filter((p) => p.corda === k).map((p) => p.casa);
    expect(porCorda(5)).toEqual([3, 15]);
    expect(porCorda(2)).toEqual([1, 13]);
    expect(porCorda(6)).toEqual([8]);
    expect(porCorda(1)).toEqual([8]);
    expect(porCorda(4)).toEqual([10]);
    expect(porCorda(3)).toEqual([5]);
  });

  it('enarmonia: Bb e A# dão as mesmas posições', () => {
    expect(posicoesDe('Bb')).toEqual(posicoesDe('A#'));
  });

  it('respeita a faixa', () => {
    expect(posicoesDe('E', [1, 11]).map((p) => p.corda + ':' + p.casa)).toEqual([
      '5:7',
      '4:2',
      '3:9',
      '2:5',
    ]);
  });
});

describe('formatarNota', () => {
  it('troca acidentes por símbolos', () => {
    expect(formatarNota('Bb')).toBe('B♭');
    expect(formatarNota('F#')).toBe('F♯');
    expect(formatarNota('Bbb')).toBe('B♭♭');
  });
  it('dó-ré-mi', () => {
    expect(formatarNota('C', 'do-re-mi')).toBe('Dó');
    expect(formatarNota('Bb3', 'do-re-mi')).toBe('Si♭');
    expect(formatarNota('F#', 'do-re-mi')).toBe('Fá♯');
  });
});

describe('TONS', () => {
  it('cobre as 12 classes sem repetir', () => {
    expect(new Set(TONS.map(croma)).size).toBe(12);
  });
});
