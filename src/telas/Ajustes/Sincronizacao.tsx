import { useState } from 'react';
import { useProgresso } from '../../estado/progresso';
import { FalhaSync, gist, MENSAGEM_ERRO } from '../../progresso/gist';
import css from './Ajustes.module.css';

type Teste =
  { estado: 'testando' } | { estado: 'ok' } | { estado: 'erro'; mensagem: string } | null;

/** Token do GitHub (só Gists) para sincronizar o progresso entre aparelhos. */
export function Sincronizacao() {
  const { sync, sincronizar } = useProgresso();
  const [temToken, setTemToken] = useState(() => gist.temToken());
  const [rascunho, setRascunho] = useState('');
  const [teste, setTeste] = useState<Teste>(null);

  const salvarETestar = async () => {
    const tk = rascunho.trim();
    if (!tk) return;
    setTeste({ estado: 'testando' });
    try {
      await gist.testar(tk);
      gist.definirToken(tk);
      setRascunho('');
      setTemToken(true);
      setTeste({ estado: 'ok' });
      await sincronizar();
    } catch (e) {
      const tipo = e instanceof FalhaSync ? e.tipo : 'servidor';
      // Token inválido não é salvo; o progresso local continua intacto.
      setTeste({ estado: 'erro', mensagem: MENSAGEM_ERRO[tipo] });
    }
  };

  const ultima = sync.ultima ? new Date(sync.ultima).toLocaleString('pt-BR') : null;

  return (
    <section className="pilha" aria-labelledby="aj-sync">
      <h2 id="aj-sync">Sincronização</h2>

      {!temToken ? (
        <>
          <p className="mudo">
            Para levar o progresso a outros aparelhos, crie um token no GitHub: Settings → Developer
            settings → Fine-grained tokens → permissão de conta{' '}
            <strong>Gists: Read and write</strong>, nada mais. Cole aqui; ele fica só neste
            aparelho.
          </p>
          <form
            className={css.token}
            onSubmit={(e) => {
              e.preventDefault();
              void salvarETestar();
            }}
          >
            <label htmlFor="aj-token" className="rotulo">
              Token do GitHub
            </label>
            <input
              id="aj-token"
              type="password"
              autoComplete="off"
              spellCheck={false}
              value={rascunho}
              onChange={(e) => setRascunho(e.target.value)}
              placeholder="github_pat_…"
            />
            <button
              type="submit"
              className="btn btn-primario"
              disabled={!rascunho.trim() || teste?.estado === 'testando'}
            >
              {teste?.estado === 'testando' ? 'Testando conexão…' : 'Salvar e testar'}
            </button>
          </form>
        </>
      ) : (
        <>
          <p role="status">
            {sync.status === 'sincronizando'
              ? 'Sincronizando…'
              : sync.status === 'erro' && sync.erro
                ? MENSAGEM_ERRO[sync.erro]
                : ultima
                  ? `Sincronizado em ${ultima}.`
                  : 'Token salvo.'}
          </p>
          <div className="linha">
            <button
              className="btn"
              disabled={sync.status === 'sincronizando'}
              onClick={() => void sincronizar()}
            >
              Sincronizar agora
            </button>
            <button
              className="btn"
              onClick={() => {
                gist.removerToken();
                setTemToken(false);
                setTeste(null);
                void sincronizar();
              }}
            >
              Remover token
            </button>
          </div>
        </>
      )}

      {teste?.estado === 'ok' && <p className={css.ok}>Conexão ok.</p>}
      {teste?.estado === 'erro' && (
        <p className={css.erro} role="alert">
          {teste.mensagem}
        </p>
      )}
    </section>
  );
}
