// ÚNICO módulo que lê o token do GitHub (CLAUDE.md). O token fica só neste aparelho.
import type { Progresso } from '../tipos';
import { armazenamento as armazenamentoLocal, normalizar } from './local';

export const ARQUIVO = 'braco-canhoto-progresso.json';
const API = 'https://api.github.com';
const CHAVE_TOKEN = 'braco-canhoto:token';
const CHAVE_GIST = 'braco-canhoto:gist-id';
const CHAVE_ULTIMA = 'braco-canhoto:ultima-sync';

export type ErroSync = 'sem-token' | 'token-invalido' | 'sem-permissao' | 'rede' | 'servidor';

export class FalhaSync extends Error {
  constructor(public tipo: ErroSync) {
    super(tipo);
  }
}

export const MENSAGEM_ERRO: Record<ErroSync, string> = {
  'sem-token': 'Sincronização desligada: nenhum token salvo.',
  'token-invalido': 'Token inválido ou expirado. Crie um novo e cole em Ajustes.',
  'sem-permissao': 'O token não tem permissão de Gists (leitura e escrita).',
  rede: 'Sem conexão com o GitHub. Seu progresso está salvo neste aparelho.',
  servidor: 'O GitHub não respondeu como esperado. Tente de novo em instantes.',
};

interface Armazenamento {
  ler: (chave: string) => string | null;
  gravar: (chave: string, valor: string) => void;
}

export interface Dependencias {
  fetch: typeof fetch;
  armazenamento: Armazenamento;
}

export function criarClienteGist(dep: Dependencias) {
  const token = () => dep.armazenamento.ler(CHAVE_TOKEN) || null;

  async function pedir(caminho: string, init: RequestInit = {}, tk = token()): Promise<unknown> {
    if (!tk) throw new FalhaSync('sem-token');
    let r: Response;
    try {
      r = await dep.fetch(API + caminho, {
        ...init,
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${tk}`,
          'X-GitHub-Api-Version': '2022-11-28',
          ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        },
      });
    } catch {
      throw new FalhaSync('rede');
    }
    if (r.status === 401) throw new FalhaSync('token-invalido');
    if (r.status === 403 || r.status === 404)
      throw new FalhaSync(r.status === 403 ? 'sem-permissao' : 'servidor');
    if (!r.ok) throw new FalhaSync('servidor');
    return r.json();
  }

  interface Gist {
    id: string;
    files: Record<string, { content?: string; truncated?: boolean; raw_url?: string } | undefined>;
  }

  async function acharGist(): Promise<string | null> {
    const salvo = dep.armazenamento.ler(CHAVE_GIST);
    if (salvo) return salvo;
    // Outro aparelho pode já ter criado: procura pelo nome do arquivo.
    const lista = (await pedir('/gists?per_page=100')) as Gist[];
    const achado = lista.find((g) => g.files && ARQUIVO in g.files);
    if (achado) dep.armazenamento.gravar(CHAVE_GIST, achado.id);
    return achado?.id ?? null;
  }

  return {
    temToken: () => token() !== null,

    definirToken(novo: string) {
      dep.armazenamento.gravar(CHAVE_TOKEN, novo.trim());
      dep.armazenamento.gravar(CHAVE_GIST, '');
    },

    removerToken() {
      dep.armazenamento.gravar(CHAVE_TOKEN, '');
      dep.armazenamento.gravar(CHAVE_GIST, '');
    },

    ultimaSync: () => dep.armazenamento.ler(CHAVE_ULTIMA) || null,

    /** "Testar conexão": confere se o token lê e lista gists. */
    async testar(tk = token()): Promise<void> {
      await pedir('/gists?per_page=1', {}, tk);
    },

    /** Progresso guardado no Gist, ou null se ainda não existe. */
    async baixar(): Promise<Progresso | null> {
      const id = await acharGist();
      if (!id) return null;
      let g: Gist;
      try {
        g = (await pedir(`/gists/${id}`)) as Gist;
      } catch (e) {
        // Gist apagado pelo usuário: esquece o id e recomeça.
        if (e instanceof FalhaSync && e.tipo === 'servidor') {
          dep.armazenamento.gravar(CHAVE_GIST, '');
          return null;
        }
        throw e;
      }
      const arq = g.files[ARQUIVO];
      if (!arq?.content) return null;
      try {
        return normalizar(JSON.parse(arq.content));
      } catch {
        return null;
      }
    },

    /** Grava o progresso no Gist (cria um Gist secreto na primeira vez). */
    async subir(p: Progresso): Promise<void> {
      const conteudo = JSON.stringify(p);
      const id = await acharGist();
      const files = { [ARQUIVO]: { content: conteudo } };
      if (id) {
        await pedir(`/gists/${id}`, { method: 'PATCH', body: JSON.stringify({ files }) });
      } else {
        const g = (await pedir('/gists', {
          method: 'POST',
          body: JSON.stringify({ description: 'Progresso do Braço Canhoto', public: false, files }),
        })) as Gist;
        dep.armazenamento.gravar(CHAVE_GIST, g.id);
      }
      dep.armazenamento.gravar(CHAVE_ULTIMA, new Date().toISOString());
    },
  };
}

export type ClienteGist = ReturnType<typeof criarClienteGist>;

/** Cliente real do app. */
export const gist: ClienteGist = criarClienteGist({
  fetch: (...a) => globalThis.fetch(...a),
  armazenamento: armazenamentoLocal,
});
