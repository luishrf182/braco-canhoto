import { Link } from 'wouter';
import { useProgresso } from '../../estado/progresso';
import { MENSAGEM_ERRO } from '../../progresso/gist';
import css from './AvisoSync.module.css';

/**
 * Estado da sincronização. `discreto`: só aparece quando há erro (Hoje).
 * Completo: mostra "Salvando…", "Salvo e sincronizado" ou "Salvo só neste aparelho" (Resultado).
 */
export function AvisoSync({ discreto = false }: { discreto?: boolean }) {
  const { sync, sincronizar } = useProgresso();

  if (sync.status === 'sincronizando') {
    return discreto ? null : (
      <p className={css.aviso} role="status">
        Salvando…
      </p>
    );
  }
  if (sync.status === 'erro') {
    return (
      <p className={`${css.aviso} ${css.erro}`} role="status">
        <span>Salvo só neste aparelho. {sync.erro ? MENSAGEM_ERRO[sync.erro] : ''}</span>
        {sync.erro === 'token-invalido' || sync.erro === 'sem-permissao' ? (
          <Link href="/ajustes" className="btn btn-fantasma">
            Ajustes
          </Link>
        ) : (
          <button className="btn btn-fantasma" onClick={() => void sincronizar()}>
            Tentar de novo
          </button>
        )}
      </p>
    );
  }
  if (discreto) return null;
  if (sync.status === 'desligado') {
    return (
      <p className={css.aviso} role="status">
        Salvo neste aparelho. Para usar em outros aparelhos, ative a sincronização em{' '}
        <Link href="/ajustes">Ajustes</Link>.
      </p>
    );
  }
  return (
    <p className={css.aviso} role="status">
      Salvo e sincronizado.
    </p>
  );
}
