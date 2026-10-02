import { describe, expect, it } from 'vitest';
import { gerarExercicio } from './index';
import { acertouToque } from './mapa';
import { MAPA_DO_BRACO } from '../conteudo/treinos/mapa';
import { notaNa } from '../teoria/notas';

const modelo = (id: string) => MAPA_DO_BRACO.find((m) => m.id === id)!;

describe('geradores do Mapa do braço', () => {
  it('quizNomePonto: respostas batem com a nota do ponto e respeitam a faixa', () => {
    const ex = gerarExercicio(modelo('mapa-nome-ponto'), { semente: 7 });
    expect(ex.quiz).toHaveLength(8);
    for (const p of ex.quiz!) {
      if (p.tipo !== 'nome-do-ponto') throw new Error('tipo');
      expect(p.resposta).toBe(notaNa(p.corda, p.casa).croma);
      expect(p.casa).toBeGreaterThanOrEqual(0);
      expect(p.casa).toBeLessThanOrEqual(12);
    }
  });

  it('casa 12 em diante só pergunta 12–15', () => {
    const ex = gerarExercicio(modelo('mapa-casa-12'), { semente: 3 });
    expect(ex.quiz!.every((p) => p.tipo === 'nome-do-ponto' && p.casa >= 12)).toBe(true);
  });

  it('acertouToque aceita qualquer posição da nota e respeita a corda', () => {
    const p = { tipo: 'tocar-nota' as const, nota: 'F', faixa: [0, 12] as [number, number] };
    expect(acertouToque(p, 6, 1)).toBe(true);
    expect(acertouToque(p, 4, 3)).toBe(true);
    expect(acertouToque(p, 4, 4)).toBe(false);
    expect(acertouToque({ ...p, corda: 1 }, 6, 1)).toBe(false);
    expect(acertouToque({ ...p, corda: 1 }, 1, 1)).toBe(true);
    expect(acertouToque({ ...p, nota: 'Bb' }, 5, 1)).toBe(true);
  });

  it('todasAsNotas: só a nota pedida, em ordem crescente de altura', () => {
    const ex = gerarExercicio(modelo('mapa-todas-notas'), { tom: 'Eb', semente: 1 });
    expect(ex.marcadores.every((m) => notaNa(m.corda, m.casa).croma === 3)).toBe(true);
    const alturas = ex.eventos!.map((e) => e.midi as number);
    expect([...alturas].sort((a, b) => a - b)).toEqual(alturas);
    expect(ex.chave).toBe('mapa-todas-notas|Eb|-');
  });

  it('oitavas: eventos em pares de 12 semitons', () => {
    const ex = gerarExercicio(modelo('mapa-oitavas'), { tom: 'G', semente: 1 });
    const ev = ex.eventos!;
    for (let i = 0; i < ev.length; i += 2) {
      expect((ev[i + 1]!.midi as number) - (ev[i]!.midi as number)).toBe(12);
    }
  });
});
