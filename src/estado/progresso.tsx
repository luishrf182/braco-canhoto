import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { carregarLocal, salvarLocal } from '../progresso/local';
import type { Ajustes, Progresso } from '../tipos';

interface ContextoProgresso {
  progresso: Progresso;
  ajustes: Ajustes;
  atualizarAjustes: (parcial: Partial<Omit<Ajustes, 'atualizadoEm'>>) => void;
  atualizar: (fn: (p: Progresso) => Progresso) => void;
}

const Contexto = createContext<ContextoProgresso | null>(null);

export function ProvedorProgresso({ children }: { children: ReactNode }) {
  const [progresso, setProgresso] = useState<Progresso>(() => carregarLocal());

  const atualizar = useCallback((fn: (p: Progresso) => Progresso) => {
    setProgresso((anterior) => {
      const novo = { ...fn(anterior), atualizadoEm: new Date().toISOString() };
      salvarLocal(novo);
      return novo;
    });
  }, []);

  const atualizarAjustes = useCallback(
    (parcial: Partial<Omit<Ajustes, 'atualizadoEm'>>) =>
      atualizar((p) => ({
        ...p,
        ajustes: { ...p.ajustes, ...parcial, atualizadoEm: new Date().toISOString() },
      })),
    [atualizar],
  );

  const valor = useMemo(
    () => ({ progresso, ajustes: progresso.ajustes, atualizar, atualizarAjustes }),
    [progresso, atualizar, atualizarAjustes],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useProgresso(): ContextoProgresso {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error('useProgresso fora do ProvedorProgresso');
  return ctx;
}
