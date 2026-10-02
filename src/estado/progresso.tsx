import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { aplicarAvaliacao, hojeISO } from '../agenda/caixas';
import { carregarLocal, salvarLocal } from '../progresso/local';
import type { Ajustes, Avaliacao, ItemProgresso, Progresso } from '../tipos';

interface ContextoProgresso {
  progresso: Progresso;
  ajustes: Ajustes;
  atualizarAjustes: (parcial: Partial<Omit<Ajustes, 'atualizadoEm'>>) => void;
  atualizar: (fn: (p: Progresso) => Progresso) => void;
  /** Grava a avaliação de um item e devolve o item atualizado. */
  registrarAvaliacao: (chave: string, avaliacao: Avaliacao, bpm?: number) => ItemProgresso;
}

const Contexto = createContext<ContextoProgresso | null>(null);

export function ProvedorProgresso({ children }: { children: ReactNode }) {
  const [progresso, setProgresso] = useState<Progresso>(() => carregarLocal());
  // Cópia síncrona do estado mais recente: duas gravações seguidas não se perdem.
  const atualRef = useRef(progresso);

  const atualizar = useCallback((fn: (p: Progresso) => Progresso) => {
    const novo = { ...fn(atualRef.current), atualizadoEm: new Date().toISOString() };
    atualRef.current = novo;
    salvarLocal(novo);
    setProgresso(novo);
  }, []);

  const atualizarAjustes = useCallback(
    (parcial: Partial<Omit<Ajustes, 'atualizadoEm'>>) =>
      atualizar((p) => ({
        ...p,
        ajustes: { ...p.ajustes, ...parcial, atualizadoEm: new Date().toISOString() },
      })),
    [atualizar],
  );

  const registrarAvaliacao = useCallback(
    (chave: string, avaliacao: Avaliacao, bpm?: number) => {
      const agora = new Date();
      const atual = atualRef.current.itens[chave];
      const item = aplicarAvaliacao(atual, avaliacao, hojeISO(agora), agora.toISOString(), bpm);
      atualizar((p) => ({ ...p, itens: { ...p.itens, [chave]: item } }));
      return item;
    },
    [atualizar],
  );

  const valor = useMemo(
    () => ({
      progresso,
      ajustes: progresso.ajustes,
      atualizar,
      atualizarAjustes,
      registrarAvaliacao,
    }),
    [progresso, atualizar, atualizarAjustes, registrarAvaliacao],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useProgresso(): ContextoProgresso {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error('useProgresso fora do ProvedorProgresso');
  return ctx;
}
