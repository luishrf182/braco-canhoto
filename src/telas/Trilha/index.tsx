import { Link } from 'wouter';
import { TREINOS } from '../../conteudo';
import { useProgresso } from '../../estado/progresso';
import type { ModeloExercicio } from '../../exercicios/tipos';
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

export function Trilha() {
  return (
    <div className={css.tela}>
      <h1>Trilha</h1>

      <section className={css.secao} aria-labelledby="tr-treinos">
        <h2 id="tr-treinos">Treinos permanentes</h2>
        {TREINOS.map((t) => (
          <div key={t.id} className={css.bloco}>
            <div className={css.cabecalho}>
              <h3>{t.titulo}</h3>
              <p className="mudo">{t.descricao}</p>
            </div>
            <ul className={css.lista}>
              {t.modelos.map((m) => (
                <li key={m.id}>
                  <Link href={`/exercicio/${m.id}`} className={css.item}>
                    <span>{m.titulo}</span>
                    <StatusModelo modelo={m} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
