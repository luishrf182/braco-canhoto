import { describe, expect, it } from 'vitest';
import { cifra } from './cifra';
import { cadencia, campoHarmonico, relativaMaior, relativaMenor } from './campo';
import { TONS } from './notas';

const cifras = (tom: string, tipo: 'triade' | 'tetrade' = 'tetrade') =>
  campoHarmonico(tom, tipo).map((g) => cifra(g.acorde));

describe('campo harmônico maior', () => {
  it('fatos conhecidos em tétrades', () => {
    expect(cifras('C')).toEqual(['C7M', 'Dm7', 'Em7', 'F7M', 'G7', 'Am7', 'Bm7(b5)']);
    expect(cifras('G')).toEqual(['G7M', 'Am7', 'Bm7', 'C7M', 'D7', 'Em7', 'F♯m7(b5)']);
    expect(cifras('Eb')).toEqual(['E♭7M', 'Fm7', 'Gm7', 'A♭7M', 'B♭7', 'Cm7', 'Dm7(b5)']);
    expect(cifras('F#')).toEqual(['F♯7M', 'G♯m7', 'A♯m7', 'B7M', 'C♯7', 'D♯m7', 'E♯m7(b5)']);
  });

  it('tríades', () => {
    expect(cifras('C', 'triade')).toEqual(['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bm(b5)']);
  });

  it('nos 12 tons: mesma sequência de qualidades e rótulos de grau', () => {
    for (const t of TONS) {
      const c = campoHarmonico(t, 'tetrade');
      expect(
        c.map((g) => g.rotulo),
        t,
      ).toEqual(['I7M', 'IIm7', 'IIIm7', 'IV7M', 'V7', 'VIm7', 'VIIm7(b5)']);
      // Cada grau usa só notas da escala (7 letras distintas, uma vez cada).
      const letras = new Set(c.map((g) => g.acorde.fundamental[0]));
      expect(letras.size, t).toBe(7);
    }
  });

  it('funções', () => {
    const f = campoHarmonico('C', 'tetrade').map((g) => g.funcao);
    expect(f).toEqual([
      'tônica',
      'subdominante',
      'tônica',
      'subdominante',
      'dominante',
      'tônica',
      'dominante',
    ]);
  });
});

describe('cadência', () => {
  const nomes = (tom: string, g: string[]) => cadencia(tom, g).map((x) => cifra(x.acorde));
  it('I–V–VIm–IV em C e em D', () => {
    expect(nomes('C', ['I', 'V', 'VIm', 'IV'])).toEqual(['C7M', 'G7', 'Am7', 'F7M']);
    expect(nomes('D', ['I', 'V', 'VIm', 'IV'])).toEqual(['D7M', 'A7', 'Bm7', 'G7M']);
  });
  it('V/3 põe a 3ª no baixo', () => {
    expect(nomes('C', ['I', 'V/3', 'VIm'])).toEqual(['C7M', 'G7/B', 'Am7']);
  });
  it('V7/VI é a dominante do VI grau', () => {
    expect(nomes('C', ['VIm', 'V', 'IV', 'V7/VI'])).toEqual(['Am7', 'G7', 'F7M', 'E7']);
    expect(nomes('G', ['V7/VI'])).toEqual(['B7']);
    expect(nomes('F', ['V7/VI'])).toEqual(['A7']);
  });
  it('grau inválido falha', () => {
    expect(() => cadencia('C', ['VIII'])).toThrow();
  });
});

describe('relativas', () => {
  it('C ↔ Am, F ↔ Dm, E♭ ↔ Cm, A ↔ F♯m', () => {
    expect(relativaMenor('C')).toBe('A');
    expect(relativaMenor('F')).toBe('D');
    expect(relativaMenor('Eb')).toBe('C');
    expect(relativaMenor('A')).toBe('F#');
    expect(relativaMaior('A')).toBe('C');
    expect(relativaMaior('C')).toBe('Eb');
  });
});
