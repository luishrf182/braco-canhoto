import { useEffect } from 'react';
import type { Avaliacao as TAvaliacao } from '../../tipos';
import css from './Avaliacao.module.css';

const OPCOES: { valor: TAvaliacao; rotulo: string; tecla: string; dica: string }[] = [
  { valor: 'limpo', rotulo: 'Limpo', tecla: '1', dica: '+4 BPM' },
  { valor: 'quase', rotulo: 'Quase', tecla: '2', dica: 'mesmo BPM' },
  { valor: 'travou', rotulo: 'Travou', tecla: '3', dica: '−8 BPM' },
];

interface Props {
  aoAvaliar: (a: TAvaliacao) => void;
  /** Sugestão do app (quiz); Enter aceita. */
  sugerida?: TAvaliacao;
  desabilitada?: boolean;
}

export function Avaliacao({ aoAvaliar, sugerida, desabilitada }: Props) {
  useEffect(() => {
    if (desabilitada) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      const op = OPCOES.find((o) => o.tecla === e.key);
      if (op) {
        e.preventDefault();
        aoAvaliar(op.valor);
      } else if (e.key === 'Enter' && sugerida && !(e.target instanceof HTMLButtonElement)) {
        e.preventDefault();
        aoAvaliar(sugerida);
      }
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [aoAvaliar, sugerida, desabilitada]);

  return (
    <div className={css.avaliacao} role="group" aria-label="Como foi?">
      {OPCOES.map((o) => (
        <button
          key={o.valor}
          className={`${css.botao} ${css[o.valor]} ${sugerida === o.valor ? css.sugerida : ''}`}
          onClick={() => aoAvaliar(o.valor)}
          disabled={desabilitada}
          aria-keyshortcuts={o.tecla}
        >
          <span className={css.rotulo}>{o.rotulo}</span>
          <span className={css.dica}>
            <kbd>{o.tecla}</kbd> {o.dica}
          </span>
        </button>
      ))}
    </div>
  );
}
