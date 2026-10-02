import { describe, expect, it } from 'vitest';
import { normalizar } from './local';
import { progressoPadrao } from '../tipos';

describe('normalizar', () => {
  it('devolve o padrão para lixo', () => {
    expect(normalizar(null)).toEqual(progressoPadrao());
    expect(normalizar({ schemaVersion: 99 })).toEqual(progressoPadrao());
  });

  it('completa ajustes que faltam sem perder os existentes', () => {
    const p = normalizar({ schemaVersion: 1, ajustes: { tema: 'escuro' } });
    expect(p.ajustes.tema).toBe('escuro');
    expect(p.ajustes.espelhoHorizontal).toBe(true);
    expect(p.ajustes.sessaoMinutos).toBe(20);
  });

  it('guarda só as últimas 60 sessões', () => {
    const sessoes = Array.from({ length: 70 }, (_, i) => ({
      id: String(i),
      data: '2026-01-01',
      minutos: 20,
      itens: [],
    }));
    const p = normalizar({ schemaVersion: 1, sessoes });
    expect(p.sessoes).toHaveLength(60);
    expect(p.sessoes[0]?.id).toBe('10');
  });
});
