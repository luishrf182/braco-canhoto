import { describe, expect, it } from 'vitest';
import { gerarExercicio } from './index';
import { TETRADES } from '../conteudo/modulos/tetrades';
import { acorde } from '../teoria/acordes';
import { croma, notaNa } from '../teoria/notas';

const modelo = (id: string) => TETRADES.modelos.find((m) => m.id === id)!;

describe('geradores de tétrades', () => {
  it('verTetrade: notas do acorde, instrução com cifra e forma', () => {
    const ex = gerarExercicio(modelo('tetrade-m7b5'), { tom: 'B', forma: 'E', semente: 1 });
    expect(ex.instrucao).toBe('Bm7(b5) · forma de E · abertura 2');
    const classes = new Set(acorde('B', 'm7(b5)').notas.map((n) => croma(n.nota)));
    for (const m of ex.marcadores) expect(classes.has(notaNa(m.corda, m.casa).croma)).toBe(true);
    expect(ex.chave).toBe('tetrade-m7b5|B|E');
    expect(ex.eventos![0]!.midi).toHaveLength(4);
  });

  it('identificar: resposta está entre as opções e bate com o voicing', () => {
    const ex = gerarExercicio(modelo('tetrade-identificar'), { tom: 'Eb', semente: 5 });
    expect(ex.cartas).toHaveLength(6);
    for (const c of ex.cartas!) {
      expect(c.opcoes).toContain(c.resposta);
      expect(new Set(c.opcoes).size).toBe(4);
      expect(c.resposta.startsWith('E♭')).toBe(true);
    }
  });

  it('onde está a 7ª: os índices certos apontam para a 7ª', () => {
    const ex = gerarExercicio(modelo('tetrade-onde-7'), { tom: 'G', semente: 9 });
    for (const p of ex.quiz!) {
      if (p.tipo !== 'marcar-grau') throw new Error('tipo');
      expect(p.certos.length).toBeGreaterThan(0);
      for (const i of p.certos) expect(['7', '7M', 'bb7']).toContain(p.marcadores[i]!.grau);
    }
  });
});
