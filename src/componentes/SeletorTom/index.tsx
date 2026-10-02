import { useProgresso } from '../../estado/progresso';
import { formatarNota, TONS, type ClasseNota } from '../../teoria/notas';
import css from './SeletorTom.module.css';

interface Props {
  valor: ClasseNota;
  aoMudar: (tom: ClasseNota) => void;
  rotulo?: string;
  sortear?: boolean;
}

export function SeletorTom({ valor, aoMudar, rotulo = 'Tom', sortear = true }: Props) {
  const { ajustes } = useProgresso();
  return (
    <div className={css.seletor} role="group" aria-label={rotulo}>
      <div className={css.grade}>
        {TONS.map((t) => (
          <button key={t} className={css.tom} aria-pressed={t === valor} onClick={() => aoMudar(t)}>
            {formatarNota(t, ajustes.nomesNotas)}
          </button>
        ))}
      </div>
      {sortear && (
        <button
          className={`btn ${css.sortear}`}
          onClick={() => {
            const outros = TONS.filter((t) => t !== valor);
            aoMudar(outros[Math.floor(Math.random() * outros.length)]!);
          }}
        >
          Sortear
        </button>
      )}
    </div>
  );
}
