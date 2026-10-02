import { useLocation } from 'wouter';
import type { ItemSessao } from '../../agenda/sessao';
import { itensDiagnostico } from '../../conteudo/diagnostico';
import { useProgresso } from '../../estado/progresso';
import { iniciarSessao } from '../Sessao';
import css from './Diagnostico.module.css';

/** Diagnóstico de entrada, opcional (~10 min). Lacunas viram revisões na caixa 1. */
export function Diagnostico() {
  const [, navegar] = useLocation();
  const { atualizarAjustes } = useProgresso();

  const comecar = () => {
    const itens: ItemSessao[] = itensDiagnostico().map((i) => ({
      tipo: 'exercicio',
      ...i,
      motivo: 'revisao',
      minutos: 1,
    }));
    iniciarSessao(itens, 10, new Date(), 'diagnostico');
    atualizarAjustes({ diagnosticoVisto: true });
    navegar('/sessao', { replace: true });
  };

  const pular = () => {
    atualizarAjustes({ diagnosticoVisto: true });
    navegar('/hoje', { replace: true });
  };

  return (
    <main className={css.tela}>
      <h1>Diagnóstico (opcional)</h1>
      <p>
        Uns 10 minutos para o app saber de onde partir: tríades nas formas de E e A, a pentatônica
        nas 5 formas e nomes de notas no braço.
      </p>
      <p className="mudo">
        Avalie cada item com sinceridade. O que travar volta na revisão; nada fica bloqueado.
      </p>
      <div className={css.acoes}>
        <button className="btn btn-primario" onClick={comecar}>
          Começar diagnóstico
        </button>
        <button className="btn" onClick={pular}>
          Pular
        </button>
      </div>
    </main>
  );
}
