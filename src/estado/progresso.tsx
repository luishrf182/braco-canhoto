import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { aplicarAvaliacao, hojeISO } from '../agenda/caixas';
import { registrarErro } from '../progresso/erros';
import { FalhaSync, gist, type ErroSync } from '../progresso/gist';
import { juntar, mesmoConteudo } from '../progresso/juncao';
import { carregarLocal, salvarLocal } from '../progresso/local';
import type { Ajustes, Avaliacao, ItemProgresso, Progresso } from '../tipos';

export interface EstadoSync {
  status: 'desligado' | 'sincronizando' | 'ok' | 'erro';
  erro?: ErroSync;
  /** ISO da última sincronização bem-sucedida. */
  ultima?: string;
}

interface ContextoProgresso {
  progresso: Progresso;
  ajustes: Ajustes;
  atualizarAjustes: (parcial: Partial<Omit<Ajustes, 'atualizadoEm'>>) => void;
  atualizar: (fn: (p: Progresso) => Progresso) => void;
  /** Grava a avaliação de um item e devolve o item atualizado. */
  registrarAvaliacao: (chave: string, avaliacao: Avaliacao, bpm?: number) => ItemProgresso;
  sync: EstadoSync;
  /** Junta local + Gist e envia. A cópia local é sempre gravada antes. */
  sincronizar: () => Promise<'ok' | 'so-local'>;
}

const Contexto = createContext<ContextoProgresso | null>(null);

/** Espera depois da última mudança antes de enviar ao Gist. */
const ESPERA_SYNC_MS = 4000;

function estadoInicialSync(): EstadoSync {
  const ultima = gist.ultimaSync();
  if (!gist.temToken()) return { status: 'desligado' };
  return ultima ? { status: 'ok', ultima } : { status: 'ok' };
}

export function ProvedorProgresso({ children }: { children: ReactNode }) {
  const [progresso, setProgresso] = useState<Progresso>(() => carregarLocal());
  // Cópia síncrona do estado mais recente: duas gravações seguidas não se perdem.
  const atualRef = useRef(progresso);
  const [sync, setSync] = useState<EstadoSync>(estadoInicialSync);
  const emAndamento = useRef<Promise<'ok' | 'so-local'> | null>(null);
  const pendente = useRef(false);
  const temporizador = useRef<number | undefined>(undefined);

  const aplicar = useCallback((p: Progresso) => {
    atualRef.current = p;
    salvarLocal(p);
    setProgresso(p);
  }, []);

  const executarSync = useCallback(async (): Promise<'ok' | 'so-local'> => {
    if (!gist.temToken()) {
      setSync({ status: 'desligado' });
      return 'so-local';
    }
    setSync((s) => ({ ...s, status: 'sincronizando' }));
    try {
      const remoto = await gist.baixar();
      // Junta com o estado do momento (o usuário pode ter mexido durante o download).
      const junto = remoto ? juntar(atualRef.current, remoto) : atualRef.current;
      if (!mesmoConteudo(junto, atualRef.current)) aplicar(junto);
      if (!remoto || !mesmoConteudo(junto, remoto)) await gist.subir(junto);
      const ultima = gist.ultimaSync() ?? new Date().toISOString();
      setSync({ status: 'ok', ultima });
      return 'ok';
    } catch (e) {
      const tipo: ErroSync = e instanceof FalhaSync ? e.tipo : 'servidor';
      if (!(e instanceof FalhaSync)) registrarErro(e);
      else if (tipo !== 'rede') registrarErro(new Error(`Sincronização: ${tipo}`));
      setSync((s) => ({ ...s, status: tipo === 'sem-token' ? 'desligado' : 'erro', erro: tipo }));
      return 'so-local';
    }
  }, [aplicar]);

  const sincronizar = useCallback(async (): Promise<'ok' | 'so-local'> => {
    window.clearTimeout(temporizador.current);
    if (emAndamento.current) {
      pendente.current = true;
      return emAndamento.current;
    }
    const tarefa = executarSync().finally(() => {
      emAndamento.current = null;
      if (pendente.current) {
        pendente.current = false;
        void sincronizar();
      }
    });
    emAndamento.current = tarefa;
    return tarefa;
  }, [executarSync]);

  const agendarSync = useCallback(() => {
    if (!gist.temToken()) return;
    window.clearTimeout(temporizador.current);
    temporizador.current = window.setTimeout(() => void sincronizar(), ESPERA_SYNC_MS);
  }, [sincronizar]);

  // Ao abrir: traz o que outros aparelhos gravaram.
  useEffect(() => {
    void sincronizar();
    const aoVoltar = () => {
      if (document.visibilityState === 'visible') void sincronizar();
    };
    document.addEventListener('visibilitychange', aoVoltar);
    return () => {
      document.removeEventListener('visibilitychange', aoVoltar);
      window.clearTimeout(temporizador.current);
    };
  }, [sincronizar]);

  const atualizar = useCallback(
    (fn: (p: Progresso) => Progresso) => {
      aplicar({ ...fn(atualRef.current), atualizadoEm: new Date().toISOString() });
      agendarSync();
    },
    [aplicar, agendarSync],
  );

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
      sync,
      sincronizar,
    }),
    [progresso, atualizar, atualizarAjustes, registrarAvaliacao, sync, sincronizar],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useProgresso(): ContextoProgresso {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error('useProgresso fora do ProvedorProgresso');
  return ctx;
}
