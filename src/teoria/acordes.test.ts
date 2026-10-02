import { describe, expect, it } from 'vitest';
import { acorde, comBaixo, QUALIDADES_TETRADE } from './acordes';
import { cifra } from './cifra';
import { croma, TONS } from './notas';

const notas = (f: string, q: Parameters<typeof acorde>[1]) => acorde(f, q).notas.map((n) => n.nota);

describe('acorde', () => {
  it('fatos conhecidos', () => {
    expect(notas('C', '7M')).toEqual(['C', 'E', 'G', 'B']);
    expect(notas('D', 'm7')).toEqual(['D', 'F', 'A', 'C']);
    expect(notas('G', '7')).toEqual(['G', 'B', 'D', 'F']);
    expect(notas('B', 'm7(b5)')).toEqual(['B', 'D', 'F', 'A']);
    expect(notas('B', '°')).toEqual(['B', 'D', 'F', 'Ab']);
    expect(notas('Eb', '7M')).toEqual(['Eb', 'G', 'Bb', 'D']);
    expect(notas('F#', 'm7')).toEqual(['F#', 'A', 'C#', 'E']);
    expect(notas('A', '')).toEqual(['A', 'C#', 'E']);
    expect(notas('A', 'm')).toEqual(['A', 'C', 'E']);
  });

  it('graus e semitons das 5 qualidades', () => {
    const graus = (q: Parameters<typeof acorde>[1]) => acorde('C', q).notas.map((n) => n.grau);
    expect(graus('7M')).toEqual(['T', '3', '5', '7M']);
    expect(graus('7')).toEqual(['T', '3', '5', '7']);
    expect(graus('m7')).toEqual(['T', 'b3', '5', '7']);
    expect(graus('m7(b5)')).toEqual(['T', 'b3', 'b5', '7']);
    expect(graus('°')).toEqual(['T', 'b3', 'b5', 'bb7']);
    expect(acorde('C', '°').notas.map((n) => n.semitons)).toEqual([0, 3, 6, 9]);
  });

  it('12 tons × 5 qualidades: 4 notas distintas com as distâncias certas', () => {
    const esperado: Record<string, number[]> = {
      '7M': [0, 4, 7, 11],
      '7': [0, 4, 7, 10],
      m7: [0, 3, 7, 10],
      'm7(b5)': [0, 3, 6, 10],
      '°': [0, 3, 6, 9],
    };
    for (const t of TONS) {
      for (const q of QUALIDADES_TETRADE) {
        const a = acorde(t, q);
        const dist = a.notas.map((n) => (croma(n.nota) - croma(t) + 12) % 12);
        expect(dist, `${t}${q}`).toEqual(esperado[q]);
      }
    }
  });
});

describe('cifra brasileira', () => {
  it('formatos', () => {
    expect(cifra(acorde('C', '7M'))).toBe('C7M');
    expect(cifra(acorde('D', 'm7'))).toBe('Dm7');
    expect(cifra(acorde('G', '7'))).toBe('G7');
    expect(cifra(acorde('B', 'm7(b5)'))).toBe('Bm7(b5)');
    expect(cifra(acorde('B', '°'))).toBe('B°');
    expect(cifra(acorde('Eb', '7M'))).toBe('E♭7M');
    expect(cifra(acorde('F#', 'm7'))).toBe('F♯m7');
    expect(cifra(acorde('A', 'm'))).toBe('Am');
    expect(cifra(comBaixo(acorde('C', ''), 'E'))).toBe('C/E');
  });
});
