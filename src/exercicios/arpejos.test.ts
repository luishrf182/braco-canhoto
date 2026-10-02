import { describe, expect, it } from 'vitest';
import { gerarExercicio } from './index';
import { ARPEJOS } from '../conteudo/modulos/arpejos';
import { acorde } from '../teoria/acordes';
import { campoHarmonico } from '../teoria/campo';
import { croma, notaNa } from '../teoria/notas';

const modelo = (id: string) => ARPEJOS.modelos.find((m) => m.id === id)!;

describe('geradores de arpejo', () => {
  it('verArpejo: sobe e desce dentro da forma, só notas do acorde', () => {
    const ex = gerarExercicio(modelo('arpejo-m7'), { tom: 'G', forma: 'C', semente: 1 });
    const classes = new Set(acorde('G', 'm7').notas.map((n) => croma(n.nota)));
    const alturas = ex.eventos!.map((e) => e.midi as number);
    const topo = alturas.indexOf(Math.max(...alturas));
    expect(alturas.slice(0, topo + 1)).toEqual(
      [...alturas.slice(0, topo + 1)].sort((a, b) => a - b),
    );
    for (const m of ex.marcadores) {
      expect(classes.has(notaNa(m.corda, m.casa).croma)).toBe(true);
      expect(m.casa >= ex.sombra![0] && m.casa <= ex.sombra![1]).toBe(true);
    }
  });

  it('conectar: passa pelas 5 formas', () => {
    const ex = gerarExercicio(modelo('arpejo-conectar'), { tom: 'C', semente: 1 });
    expect(ex.instrucao.split('→')).toHaveLength(5);
    const casas = ex.marcadores.map((m) => m.casa);
    expect(Math.max(...casas) - Math.min(...casas)).toBeGreaterThanOrEqual(10);
  });

  it('campo em arpejos: cada nota tocada pertence ao acorde da vez', () => {
    const ex = gerarExercicio(modelo('arpejo-campo'), { tom: 'D', semente: 1 });
    const campo = campoHarmonico('D', 'tetrade');
    const ev = ex.eventos!;
    expect(ev).toHaveLength(7 * 8);
    campo.forEach((g, i) => {
      const classes = new Set(g.acorde.notas.map((n) => croma(n.nota)));
      for (const e of ev.slice(i * 8, i * 8 + 8))
        expect(classes.has((e.midi as number) % 12)).toBe(true);
    });
  });

  it('quiz da 3ª: as respostas certas são 3ªs', () => {
    const ex = gerarExercicio(modelo('arpejo-onde-3'), { tom: 'E', semente: 2 });
    for (const p of ex.quiz!) {
      if (p.tipo !== 'marcar-grau') throw new Error('tipo');
      expect(p.certos.length).toBeGreaterThan(0);
      for (const i of p.certos) expect(['3', 'b3']).toContain(p.marcadores[i]!.grau);
    }
  });
});
