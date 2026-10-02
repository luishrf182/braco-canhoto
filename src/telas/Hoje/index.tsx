import { useMemo, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { hojeISO } from '../../agenda/caixas';
import { duracao, type ItemSessao } from '../../agenda/sessao';
import { useProgresso } from '../../estado/progresso';
import { planejarSessao, ROTULO_MOTIVO, tituloItem } from '../../estado/sessao';
import { lerSessao } from '../../progresso/sessaoAtual';
import type { Ajustes } from '../../tipos';
import { iniciarSessao } from '../Sessao';
import css from './Hoje.module.css';

const DURACOES: Ajustes['sessaoMinutos'][] = [10, 20, 30];

export function Hoje() {
  const { progresso, ajustes, atualizarAjustes } = useProgresso();
  const [, navegar] = useLocation();
  const [variante, setVariante] = useState(0);
  const hoje = hojeISO(new Date());

  const emAndamento = useMemo(() => {
    const s = lerSessao();
    return s && !s.concluida && s.data === hoje ? s : null;
  }, [hoje]);
  const concluidaHoje = progresso.sessoes.some((s) => s.data === hoje);
  const primeiroDia = Object.keys(progresso.itens).length === 0 && !progresso.sessoes.length;

  const plano: ItemSessao[] = useMemo(
    () => planejarSessao(progresso, new Date(), variante),
    // Replaneja quando a duração muda ou o usuário pede outra; não a cada avaliação.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ajustes.sessaoMinutos, variante, progresso.sessoes.length],
  );

  const contagem = (m: ItemSessao['motivo']) => plano.filter((i) => i.motivo === m).length;

  const comecar = () => {
    iniciarSessao(plano, ajustes.sessaoMinutos);
    navegar('/sessao');
  };

  return (
    <div className={css.tela}>
      <header className={css.cabecalho}>
        <h1>Hoje</h1>
        <p className="mudo">
          {new Date().toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </p>
      </header>

      {emAndamento ? (
        <section className={`cartao ${css.destaque}`}>
          <h2>Sessão em andamento</h2>
          <p className="mudo num">
            {emAndamento.indice} de {emAndamento.itens.length} feitos
          </p>
          <button className="btn btn-primario" onClick={() => navegar('/sessao')}>
            Continuar
          </button>
        </section>
      ) : (
        <section className={`cartao ${css.destaque}`} aria-labelledby="hj-sessao">
          <div className={css.linhaTitulo}>
            <h2 id="hj-sessao">Sessão do dia</h2>
            <div className={css.duracoes} role="group" aria-label="Duração">
              {DURACOES.map((d) => (
                <button
                  key={d}
                  className="btn"
                  aria-pressed={ajustes.sessaoMinutos === d}
                  onClick={() => atualizarAjustes({ sessaoMinutos: d })}
                >
                  <span className="num">{d}</span> min
                </button>
              ))}
            </div>
          </div>

          {primeiroDia && <p>Primeiro dia: comece pelo Módulo 1, Tétrades.</p>}
          {concluidaHoje && (
            <p className="mudo">Você já fez a sessão de hoje. Quer outra rodada?</p>
          )}

          <p className="rotulo num">
            ~{duracao(plano)} min · {contagem('aquecimento')} aquecimento · {contagem('novo')} novo
            {contagem('novo') === 1 ? '' : 's'} · {contagem('revisao')} revis
            {contagem('revisao') === 1 ? 'ão' : 'ões'}
          </p>

          <ol className={css.plano}>
            {plano.map((i, idx) => (
              <li key={idx}>
                <span className={css.motivo} data-motivo={i.motivo}>
                  {ROTULO_MOTIVO[i.motivo]}
                </span>
                <span>{tituloItem(i, ajustes.nomesNotas)}</span>
              </li>
            ))}
          </ol>

          <div className="linha">
            <button className={`btn btn-primario ${css.comecar}`} onClick={comecar}>
              Começar
            </button>
            <button className="btn btn-fantasma" onClick={() => setVariante((v) => v + 1)}>
              Outra combinação
            </button>
          </div>
        </section>
      )}

      <p className="mudo">
        Prefere escolher? Vá à <Link href="/trilha">Trilha</Link> ou ao{' '}
        <Link href="/explorar">Explorar</Link>.
      </p>
    </div>
  );
}
