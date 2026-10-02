import { useMemo } from 'react';
import { Link } from 'wouter';
import { hojeISO, textoRevisao } from '../../agenda/caixas';
import { lerSessao } from '../../progresso/sessaoAtual';
import css from './Resultado.module.css';

const ROTULO = { limpo: 'Limpo', quase: 'Quase', travou: 'Travou' } as const;

export function Resultado() {
  const sessao = useMemo(() => lerSessao(), []);
  const hoje = hojeISO(new Date());

  if (!sessao || !sessao.resultados.length) {
    return (
      <main className={css.tela}>
        <h1>Nenhuma sessão concluída</h1>
        <Link href="/hoje" className="btn btn-primario">
          Ir para Hoje
        </Link>
      </main>
    );
  }

  const n = (a: keyof typeof ROTULO) => sessao.resultados.filter((r) => r.avaliacao === a).length;
  const subiram = sessao.resultados.filter(
    (r) => r.caixaAntes !== undefined && r.caixaDepois > r.caixaAntes,
  );
  const comBpm = sessao.resultados.filter((r) => r.bpm !== undefined);

  return (
    <main className={css.tela}>
      <header>
        <h1>Sessão concluída</h1>
        <p className="mudo" role="status">
          Salvo neste aparelho.
        </p>
      </header>

      <section className={css.placar} aria-label="Resumo">
        {(['limpo', 'quase', 'travou'] as const).map((a) => (
          <div key={a} className={css.numero} data-avaliacao={a}>
            <span className="num">{n(a)}</span>
            <span className="rotulo">{ROTULO[a]}</span>
          </div>
        ))}
      </section>

      {subiram.length > 0 && (
        <section className="pilha">
          <h2>O que melhorou</h2>
          <ul className={css.lista}>
            {subiram.map((r) => (
              <li key={r.chave}>
                {r.titulo}{' '}
                <span className="rotulo num">
                  caixa {r.caixaAntes} → {r.caixaDepois}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="pilha">
        <h2>Itens e próxima revisão</h2>
        <ul className={css.lista}>
          {sessao.resultados.map((r, i) => (
            <li key={r.chave + i}>
              <span className={css.avaliacao} data-avaliacao={r.avaliacao}>
                {ROTULO[r.avaliacao]}
              </span>
              <span className={css.titulo}>{r.titulo}</span>
              <span className="rotulo num">
                {r.bpm !== undefined ? `${r.bpm} BPM · ` : ''}
                {textoRevisao(r.proximaRevisao, hoje)}
              </span>
            </li>
          ))}
        </ul>
        {comBpm.length > 0 && (
          <p className="mudo">
            O BPM da próxima vez já está ajustado: +4 após Limpo, −8 após Travou.
          </p>
        )}
      </section>

      <Link href="/hoje" className={`btn btn-primario ${css.voltar}`}>
        Voltar para Hoje
      </Link>
    </main>
  );
}
