import { Link } from 'wouter';
import { statusCheckpoint } from '../../agenda/checkpoint';
import { MODULOS, TREINOS } from '../../conteudo';
import type { Modulo } from '../../conteudo/tipos';
import { useProgresso } from '../../estado/progresso';
import type { ModeloExercicio } from '../../exercicios/tipos';
import { DESENHO } from '../../teoria/voicings';
import css from './Trilha.module.css';

function StatusModelo({ modelo }: { modelo: ModeloExercicio }) {
  const { progresso } = useProgresso();
  const itens = Object.entries(progresso.itens).filter(([k]) => k.startsWith(modelo.id + '|'));
  if (!itens.length) return <span className="rotulo">novo</span>;
  const limpos = itens.filter(([, i]) => (i.limpos ?? 0) > 0).length;
  return (
    <span className="rotulo num">
      {limpos}/{itens.length} limpo{itens.length > 1 ? 's' : ''}
    </span>
  );
}

function LinhaModelo({ modelo }: { modelo: ModeloExercicio }) {
  if (modelo.formas?.length) {
    return (
      <li className={css.linhaFormas}>
        <div className={css.nomeModelo}>
          <span>{modelo.titulo}</span>
          <StatusModelo modelo={modelo} />
        </div>
        <div className={css.formas}>
          {modelo.formas.map((f) => (
            <Link
              key={f}
              href={`/exercicio/${modelo.id}/C/${f}`}
              className={css.forma}
              aria-label={`${modelo.titulo}, forma de ${f}`}
              title={`Forma de ${f} · D${DESENHO[f]}`}
            >
              {f}
            </Link>
          ))}
        </div>
      </li>
    );
  }
  return (
    <li>
      <Link href={`/exercicio/${modelo.id}`} className={css.item}>
        <span>{modelo.titulo}</span>
        <StatusModelo modelo={modelo} />
      </Link>
    </li>
  );
}

function CartaoModulo({ modulo, indice }: { modulo: Modulo; indice: number }) {
  const { progresso } = useProgresso();
  const cp = statusCheckpoint(modulo.checkpoint, progresso.itens);
  const pct = cp.total ? Math.round((cp.cumpridas / cp.total) * 100) : 0;
  return (
    <article className={css.bloco} aria-labelledby={`mod-${modulo.id}`}>
      <div className={css.cabecalho}>
        <span className="rotulo">Módulo {indice + 1}</span>
        <h3 id={`mod-${modulo.id}`}>{modulo.titulo}</h3>
        <p className="mudo">{modulo.descricao}</p>
        <div className={css.checkpoint}>
          <div
            className={css.barra}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={cp.total}
            aria-valuenow={cp.cumpridas}
            aria-label="Checkpoint do módulo"
          >
            <span style={{ width: `${pct}%` }} />
          </div>
          <span className="rotulo num">
            {cp.completo ? 'Checkpoint concluído ✓' : `Checkpoint ${cp.cumpridas}/${cp.total}`}
          </span>
        </div>
        <p className={css.criterio}>{modulo.checkpoint.descricao}</p>
      </div>

      <h4 className={css.subtitulo}>Lições</h4>
      <ul className={css.lista}>
        {modulo.licoes.map((l, i) => (
          <li key={l.id}>
            <Link href={`/licao/${modulo.id}/${l.id}`} className={css.item}>
              <span>
                <span className="num mudo">{i + 1}.</span> {l.titulo}
              </span>
              <span className="rotulo num">{l.telas.length} telas</span>
            </Link>
          </li>
        ))}
      </ul>

      <h4 className={css.subtitulo}>Exercícios</h4>
      <ul className={css.lista}>
        {modulo.modelos.map((m) => (
          <LinhaModelo key={m.id} modelo={m} />
        ))}
      </ul>
    </article>
  );
}

export function Trilha() {
  return (
    <div className={css.tela}>
      <h1>Trilha</h1>

      <section className={css.secao} aria-labelledby="tr-modulos">
        <h2 id="tr-modulos">Módulos</h2>
        {MODULOS.map((m, i) => (
          <CartaoModulo key={m.id} modulo={m} indice={i} />
        ))}
      </section>

      <section className={css.secao} aria-labelledby="tr-treinos">
        <h2 id="tr-treinos">Treinos permanentes</h2>
        {TREINOS.map((t) => (
          <article key={t.id} className={css.bloco}>
            <div className={css.cabecalho}>
              <h3>{t.titulo}</h3>
              <p className="mudo">{t.descricao}</p>
            </div>
            <ul className={css.lista}>
              {t.modelos.map((m) => (
                <LinhaModelo key={m.id} modelo={m} />
              ))}
            </ul>
          </article>
        ))}
      </section>
    </div>
  );
}
