import { describe, expect, it } from 'vitest';
import { acorde, QUALIDADES_TETRADE } from './acordes';
import { arpejo, arpejoNaRegiao, formasEmOrdem } from './arpejos';
import { croma, notaNa, TONS } from './notas';
import { FORMAS } from './voicings';

describe('arpejo', () => {
  it('as notas pertencem ao acorde e ficam dentro da janela da forma (12 tons × 5 qualidades × 5 formas)', () => {
    for (const t of TONS) {
      for (const q of QUALIDADES_TETRADE) {
        const classes = new Set(acorde(t, q).notas.map((n) => croma(n.nota)));
        for (const f of FORMAS) {
          const a = arpejo(t, q, f);
          const rot = `${t}${q} forma ${f}`;
          expect(a.janela[1] - a.janela[0], rot).toBe(4);
          for (const m of a.marcadores) {
            expect(classes.has(notaNa(m.corda, m.casa).croma), rot).toBe(true);
            expect(m.casa >= a.janela[0] && m.casa <= a.janela[1], rot).toBe(true);
          }
          // Todas as funções aparecem e há pelo menos duas tônicas.
          expect(new Set(a.marcadores.map((m) => m.papel)).size, rot).toBe(4);
          expect(
            a.marcadores.filter((m) => m.papel === 'fundamental').length,
            rot,
          ).toBeGreaterThanOrEqual(2);
        }
      }
    }
  });

  it('C7M na forma de A: casas 2–6, com a tônica na 5ª corda casa 3', () => {
    const a = arpejo('C', '7M', 'A');
    expect(a.janela).toEqual([2, 6]);
    expect(
      a.marcadores.some((m) => m.corda === 5 && m.casa === 3 && m.papel === 'fundamental'),
    ).toBe(true);
  });

  it('as 5 formas sobem pelo braço sem repetir janela', () => {
    const f = formasEmOrdem('C', 'm7');
    const inicios = f.map((a) => a.janela[0]);
    expect(new Set(inicios).size).toBe(5);
    expect([...inicios].sort((a, b) => a - b)).toEqual(inicios);
  });

  it('arpejoNaRegiao fica perto da casa pedida', () => {
    for (const t of TONS) {
      const a = arpejoNaRegiao(t, 'm7', 5);
      expect(Math.abs(a.janela[0] + 2 - 5), t).toBeLessThanOrEqual(2);
    }
  });
});
