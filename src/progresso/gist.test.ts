import { describe, expect, it } from 'vitest';
import { progressoPadrao } from '../tipos';
import { ARQUIVO, criarClienteGist, FalhaSync } from './gist';

/** GitHub falso em memória: um conjunto de gists por token. */
function githubFalso(tokensValidos = ['bom']) {
  const gists = new Map<string, { id: string; files: Record<string, { content: string }> }>();
  let n = 0;
  const chamadas: string[] = [];
  const fetchFalso = (async (url: string, init: RequestInit = {}) => {
    const metodo = init.method ?? 'GET';
    chamadas.push(`${metodo} ${url.replace('https://api.github.com', '')}`);
    const auth = (init.headers as Record<string, string>).Authorization ?? '';
    if (!tokensValidos.includes(auth.replace('Bearer ', '')))
      return new Response('{}', { status: 401 });
    const caminho = url.replace('https://api.github.com', '');
    const json = (x: unknown, status = 200) => new Response(JSON.stringify(x), { status });
    if (caminho.startsWith('/gists?')) return json([...gists.values()]);
    if (caminho === '/gists' && metodo === 'POST') {
      const corpo = JSON.parse(String(init.body));
      const g = { id: `g${++n}`, files: corpo.files };
      gists.set(g.id, g);
      return json(g, 201);
    }
    const id = caminho.split('/')[2]!;
    const g = gists.get(id);
    if (!g) return json({}, 404);
    if (metodo === 'PATCH') {
      g.files = { ...g.files, ...JSON.parse(String(init.body)).files };
      return json(g);
    }
    return json(g);
  }) as unknown as typeof fetch;
  return { fetch: fetchFalso, gists, chamadas };
}

function aparelho(gh: ReturnType<typeof githubFalso>) {
  const mem = new Map<string, string>();
  const armazenamento = {
    ler: (k: string) => mem.get(k) ?? null,
    gravar: (k: string, v: string) => void mem.set(k, v),
  };
  return { cliente: criarClienteGist({ fetch: gh.fetch, armazenamento }), mem };
}

describe('cliente do Gist', () => {
  it('sem token: falha "sem-token" e não chama a rede', async () => {
    const gh = githubFalso();
    const { cliente } = aparelho(gh);
    await expect(cliente.baixar()).rejects.toMatchObject({ tipo: 'sem-token' });
    expect(gh.chamadas).toHaveLength(0);
  });

  it('token inválido: mensagem clara, nada é apagado', async () => {
    const gh = githubFalso();
    const { cliente, mem } = aparelho(gh);
    mem.set('braco-canhoto:progresso', 'local');
    cliente.definirToken('ruim');
    const erro = await cliente.subir(progressoPadrao()).catch((e) => e);
    expect(erro).toBeInstanceOf(FalhaSync);
    expect(erro.tipo).toBe('token-invalido');
    expect(mem.get('braco-canhoto:progresso')).toBe('local');
  });

  it('primeiro envio cria um gist secreto; o segundo aparelho o encontra pelo nome', async () => {
    const gh = githubFalso();
    const a = aparelho(gh);
    a.cliente.definirToken('bom');
    const p = progressoPadrao();
    p.itens['x|C|-'] = {
      caixa: 2,
      ultimaAvaliacao: 'limpo',
      proximaRevisao: '2026-01-01',
      atualizadoEm: 't',
    };
    await a.cliente.subir(p);
    expect(gh.gists.size).toBe(1);
    const criado = [...gh.gists.values()][0]!;
    expect(Object.keys(criado.files)).toEqual([ARQUIVO]);
    expect(gh.chamadas.some((c) => c.startsWith('POST /gists'))).toBe(true);

    const b = aparelho(gh);
    b.cliente.definirToken('bom');
    const baixado = await b.cliente.baixar();
    expect(baixado?.itens['x|C|-']?.caixa).toBe(2);
    // Segundo envio atualiza o mesmo gist.
    await b.cliente.subir(baixado!);
    expect(gh.gists.size).toBe(1);
    expect(gh.chamadas.some((c) => c.startsWith('PATCH /gists/g1'))).toBe(true);
  });

  it('erro de rede vira "rede"', async () => {
    const { cliente } = aparelho({
      fetch: (async () => {
        throw new TypeError('Failed to fetch');
      }) as unknown as typeof fetch,
      gists: new Map(),
      chamadas: [],
    });
    cliente.definirToken('bom');
    await expect(cliente.testar()).rejects.toMatchObject({ tipo: 'rede' });
  });

  it('gist apagado no site: recomeça criando outro', async () => {
    const gh = githubFalso();
    const { cliente } = aparelho(gh);
    cliente.definirToken('bom');
    await cliente.subir(progressoPadrao());
    gh.gists.clear();
    expect(await cliente.baixar()).toBeNull();
    await cliente.subir(progressoPadrao());
    expect(gh.gists.size).toBe(1);
  });
});
