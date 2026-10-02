import { useEffect, useState, type ReactNode } from 'react';
import * as audio from '../../audio/motor';
import { ehIos, useEstadoAudio, useTocandoAgora } from '../../estado/audio';
import { useProgresso } from '../../estado/progresso';
import css from './BarraReproducao.module.css';

export const BPM_MIN = 30;
export const BPM_MAX = 240;

interface Props {
  bpm: number;
  aoMudarBpm: (bpm: number) => void;
  /** Chamado após o áudio estar pronto, para começar a tocar. */
  aoTocar: () => void;
  contagem?: boolean;
  aoMudarContagem?: (v: boolean) => void;
  /** Controles extras (ex.: seletor de levada). */
  extra?: ReactNode;
  /** Captura atalhos de teclado (espaço, ←/→). Padrão: true. */
  atalhos?: boolean;
  compacta?: boolean;
}

export function BarraReproducao({
  bpm,
  aoMudarBpm,
  aoTocar,
  contagem,
  aoMudarContagem,
  extra,
  atalhos = true,
  compacta = false,
}: Props) {
  const estado = useEstadoAudio();
  const tocando = estado === 'tocando';
  const indice = useTocandoAgora();
  const { ajustes, atualizarAjustes } = useProgresso();
  const [avisoIos, setAvisoIos] = useState(false);

  const mudarBpm = (delta: number) => {
    const novo = Math.max(BPM_MIN, Math.min(BPM_MAX, bpm + delta));
    aoMudarBpm(novo);
    audio.definirBpm(novo);
  };

  const alternar = async () => {
    if (tocando) {
      audio.parar();
      return;
    }
    if (!ajustes.avisoIosVisto && ehIos()) {
      setAvisoIos(true);
      atualizarAjustes({ avisoIosVisto: true });
    }
    try {
      await audio.iniciar();
      aoTocar();
    } catch {
      // estado 'bloqueado' já mostra a mensagem
    }
  };

  useEffect(() => {
    if (!atalhos) return;
    const aoTeclar = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement | null;
      if (alvo && /^(INPUT|TEXTAREA|SELECT)$/.test(alvo.tagName)) return;
      if (e.key === ' ' && !(alvo instanceof HTMLButtonElement)) {
        e.preventDefault();
        void alternar();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        mudarBpm(e.shiftKey ? 10 : 2);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        mudarBpm(e.shiftKey ? -10 : -2);
      }
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  });

  useEffect(() => () => audio.parar(), []);

  const contando = indice <= -2 ? -1 - indice : 0;

  return (
    <div className={`${css.barra} ${compacta ? css.compacta : ''}`}>
      <button
        className={`btn btn-primario ${css.tocar}`}
        onClick={() => void alternar()}
        aria-label={tocando ? 'Parar' : 'Tocar'}
        disabled={estado === 'carregando'}
      >
        {estado === 'carregando' ? (
          <span className={css.carregando}>Carregando som…</span>
        ) : tocando ? (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="6" y="6" width="12" height="12" rx="1.5" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 5.5v13l11-6.5z" />
          </svg>
        )}
      </button>

      <div className={css.bpm}>
        <button className="btn" aria-label="Diminuir BPM" onClick={() => mudarBpm(-4)}>
          −
        </button>
        <div className={css.valor} aria-live="polite">
          <span className="num">{bpm}</span>
          <span className="rotulo">BPM</span>
        </div>
        <button className="btn" aria-label="Aumentar BPM" onClick={() => mudarBpm(4)}>
          +
        </button>
      </div>

      {aoMudarContagem && (
        <button
          className="btn"
          aria-pressed={!!contagem}
          onClick={() => aoMudarContagem(!contagem)}
          title="Contagem de entrada"
        >
          {contando ? <span className="num">{contando}…</span> : 'Contar'}
        </button>
      )}

      {extra}

      {estado === 'bloqueado' && (
        <p className={css.aviso} role="alert">
          Som bloqueado pelo navegador. Toque em ▶ para ativar.
        </p>
      )}
      {avisoIos && (
        <p className={css.aviso} role="status">
          No iPhone/iPad, desligue a chave de silencioso para ouvir.{' '}
          <button className="btn btn-fantasma" onClick={() => setAvisoIos(false)}>
            Ok
          </button>
        </p>
      )}
    </div>
  );
}
