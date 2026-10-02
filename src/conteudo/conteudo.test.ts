import { describe, expect, it } from 'vitest';
import { MODULOS, todosModelos } from './index';
import { gerarExercicio, temGerador } from '../exercicios';
import { TONS } from '../teoria/notas';

/** Conta frases: termina em . ! ? (ignorando "7ª." etc. não é problema aqui). */
function frases(texto: string): number {
  return texto
    .split(/[.!?](?:\s|$)/)
    .map((s) => s.trim())
    .filter(Boolean).length;
}

describe('conteúdo', () => {
  it('ids de modelo são únicos', () => {
    const ids = todosModelos().map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('toda tela de conceito tem no máximo 2 frases', () => {
    for (const m of MODULOS)
      for (const l of m.licoes)
        for (const t of l.telas)
          expect(frases(t.texto), `${m.id}/${l.id}: ${t.texto}`).toBeLessThanOrEqual(2);
  });

  it('toda lição estreia em C', () => {
    for (const m of MODULOS)
      for (const l of m.licoes)
        for (const t of l.telas)
          if (t.exemplo && 'tom' in t.exemplo) expect(t.exemplo.tom).toBe('C');
  });

  it('todo modelo tem gerador e gera nos 12 tons e em todas as formas', () => {
    for (const modelo of todosModelos()) {
      expect(temGerador(modelo.gerador), modelo.gerador).toBe(true);
      const formas = modelo.formas?.length ? modelo.formas : [undefined];
      for (const tom of modelo.usaTom ? TONS : ['C']) {
        for (const forma of formas) {
          const ex = gerarExercicio(modelo, { tom, semente: 11, ...(forma ? { forma } : {}) });
          expect(ex.instrucao.length, `${modelo.id} ${tom} ${forma}`).toBeGreaterThan(0);
          expect(ex.chave.startsWith(modelo.id + '|')).toBe(true);
        }
      }
    }
  });

  it('checkpoint aponta para modelos que existem', () => {
    const ids = new Set(todosModelos().map((m) => m.id));
    for (const m of MODULOS)
      for (const id of m.checkpoint.requisitos.flatMap((r) => r.modelos))
        expect(ids.has(id), id).toBe(true);
  });
});
