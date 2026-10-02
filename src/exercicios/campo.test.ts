import { describe, expect, it } from 'vitest';
import { gerarExercicio } from './index';
import { CAMPO_MAIOR } from '../conteudo/modulos/campo-maior';
import { TETRADES } from '../conteudo/modulos/tetrades';
import { acorde } from '../teoria/acordes';
import { croma, notaNa } from '../teoria/notas';

const modelo = (id: string) =>
  [...CAMPO_MAIOR.modelos, ...TETRADES.modelos].find((m) => m.id === id)!;

describe('geradores do campo harmônico', () => {
  it('cadência 6 em C: Am7 G7 F7M E7, voicings com as notas do acorde', () => {
    const ex = gerarExercicio(modelo('cadencia-6'), { tom: 'C', semente: 1 });
    expect(ex.progressao!.map((p) => p.cifra)).toEqual(['Am7', 'G7', 'F7M', 'E7']);
    const quals = ['m7', '7', '7M', '7'] as const;
    const raizes = ['A', 'G', 'F', 'E'];
    ex.progressao!.forEach((p, i) => {
      const classes = new Set(acorde(raizes[i]!, quals[i]!).notas.map((n) => croma(n.nota)));
      for (const m of p.marcadores) expect(classes.has(notaNa(m.corda, m.casa).croma)).toBe(true);
      expect(p.baixo % 12).toBe(croma(raizes[i]!));
    });
    expect(ex.levada).toBe('rock');
  });

  it('V/3 toca a 3ª no baixo (G7/B → B)', () => {
    const ex = gerarExercicio(modelo('cadencia-4'), { tom: 'C', semente: 1 });
    const v3 = ex.progressao![1]!;
    expect(v3.cifra).toBe('G7/B');
    expect(v3.baixo % 12).toBe(croma('B'));
  });

  it('campo inteiro: 7 acordes, todos perto da região', () => {
    const ex = gerarExercicio(modelo('campo-tocar'), { tom: 'A', semente: 1 });
    expect(ex.progressao).toHaveLength(7);
    for (const p of ex.progressao!)
      expect(Math.abs((p.faixa[0] + p.faixa[1]) / 2 - 5)).toBeLessThanOrEqual(4);
  });

  it('progressão do Módulo 1 em duas regiões', () => {
    const ex = gerarExercicio(modelo('tetrade-progressao'), { tom: 'C', semente: 1 });
    const p = ex.progressao!;
    expect(p.map((x) => x.cifra)).toEqual(['Dm7', 'G7', 'C7M', 'C7M', 'Dm7', 'G7', 'C7M', 'C7M']);
    const media = (xs: typeof p) => xs.reduce((s, x) => s + x.faixa[0], 0) / xs.length;
    expect(media(p.slice(4))).toBeGreaterThan(media(p.slice(0, 4)) + 2);
  });

  it('cartas: resposta sempre entre as opções', () => {
    for (const id of ['campo-qual-grau', 'campo-relativas']) {
      const ex = gerarExercicio(modelo(id), { semente: 4 });
      expect(ex.cartas).toHaveLength(8);
      for (const c of ex.cartas!) {
        expect(c.opcoes).toContain(c.resposta);
        expect(new Set(c.opcoes).size).toBe(c.opcoes.length);
      }
    }
  });
});
