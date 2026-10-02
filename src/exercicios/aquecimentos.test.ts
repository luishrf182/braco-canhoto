import { describe, expect, it } from 'vitest';
import { gerarExercicio } from './index';
import { RITMOS, sequenciaAquecimento, type TipoAquecimento } from './aquecimentos';
import { AQUECIMENTOS_TECNICOS } from '../conteudo/treinos/aquecimentos';
import { notasDaEscala, posicaoEscala } from '../teoria/escalas';
import { croma, notaNa, TONS } from '../teoria/notas';
import { FORMAS } from '../teoria/voicings';

describe('aquecimentos', () => {
  it('todo evento cai dentro da forma e do tom pedidos (12 tons × 5 formas × 5 tipos)', () => {
    for (const modelo of AQUECIMENTOS_TECNICOS) {
      for (const tom of TONS) {
        for (const forma of FORMAS) {
          const ex = gerarExercicio(modelo, { tom, forma, semente: 3 });
          const escala = (modelo.params.escala as 'penta-menor' | 'maior') ?? 'penta-menor';
          const classes = new Set(notasDaEscala(tom, escala).map(croma));
          const janela = posicaoEscala(tom, escala, forma).janela;
          const rot = `${modelo.id} ${tom} ${forma}`;
          expect(ex.eventos!.length, rot).toBeGreaterThan(8);
          for (const ev of ex.eventos!) {
            const m = ex.marcadores[ev.indice!]!;
            expect(classes.has(notaNa(m.corda, m.casa).croma), rot).toBe(true);
            expect(m.casa >= janela[0] && m.casa <= janela[1], rot).toBe(true);
            expect(ev.midi, rot).toBe(m.midi);
          }
        }
      }
    }
  });

  it('as 3 variações rítmicas mudam a duração das notas', () => {
    const modelo = AQUECIMENTOS_TECNICOS[0]!;
    const duracoes = RITMOS.map(
      (ritmo) =>
        gerarExercicio({ ...modelo, params: { ...modelo.params, ritmo } }, { tom: 'A', semente: 1 })
          .eventos![0]!.duracao,
    );
    expect(duracoes).toEqual([1 / 2, 1 / 3, 1 / 4]);
  });

  it('horizontal: grupos de 4 subindo (1-2-3-4, 2-3-4-5...)', () => {
    const p = posicaoEscala('A', 'penta-menor', 'E');
    const s = sequenciaAquecimento('horizontal' as TipoAquecimento, p);
    expect(s.slice(0, 8).map((n) => n.midi)).toEqual(
      [0, 1, 2, 3, 1, 2, 3, 4].map((i) => p.notas[i]!.midi),
    );
  });

  it('independência e ligados ficam corda a corda', () => {
    const p = posicaoEscala('A', 'penta-menor', 'E');
    for (const tipo of ['independencia', 'ligados'] as TipoAquecimento[]) {
      const s = sequenciaAquecimento(tipo, p);
      for (let i = 0; i < s.length; i += 4)
        expect(new Set(s.slice(i, i + 4).map((n) => n.corda)).size).toBe(1);
    }
  });
});

describe('dedilhado', () => {
  it('box 1 de Lá menor: dedo 1 na casa 5, dedo 4 na casa 8', async () => {
    const { AQUECIMENTOS_TECNICOS: lista } = await import('../conteudo/treinos/aquecimentos');
    const ex = gerarExercicio(lista[0]!, { tom: 'A', forma: 'E', semente: 1 });
    for (const m of ex.marcadores) expect(m.dedo).toBe(m.casa === 5 ? 1 : m.casa === 7 ? 3 : 4);
  });
});
