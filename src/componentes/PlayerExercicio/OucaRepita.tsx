import { useEffect, useRef, useState } from 'react';
import * as audio from '../../audio/motor';
import type { ExercicioConcreto } from '../../exercicios/tipos';
import { useEstadoAudio, useTocandoAgora } from '../../estado/audio';
import { BarraReproducao } from '../BarraReproducao';
import { Braco } from '../Braco';
import css from './PlayerExercicio.module.css';

type Fase = 'pronto' | 'ouvindo' | 'sua-vez';

/** Formato `ouca-repita`: contagem → o app toca → a pessoa repete no clique. */
export function OucaRepita({
  exercicio,
  bpm,
  setBpm,
}: {
  exercicio: ExercicioConcreto;
  bpm: number;
  setBpm: (b: number) => void;
}) {
  const tocandoAgora = useTocandoAgora();
  const estado = useEstadoAudio();
  const [fase, setFase] = useState<Fase>('pronto');
  const [oculto, setOculto] = useState(false);
  const faseRef = useRef(fase);
  faseRef.current = fase;

  // Quando a demonstração termina, começa o metrônomo para a pessoa repetir.
  useEffect(() => {
    if (faseRef.current === 'ouvindo' && estado === 'pronto') {
      setFase('sua-vez');
      audio.metronomo(bpm);
    }
  }, [estado, bpm]);

  useEffect(() => {
    if (estado === 'pronto' && faseRef.current === 'sua-vez') setFase('pronto');
  }, [estado]);

  const tocar = () => {
    setFase('ouvindo');
    audio.tocarSequencia(exercicio.eventos ?? [], { bpm, contagem: true, clique: true });
  };

  const aviso =
    fase === 'ouvindo' ? 'Ouça…' : fase === 'sua-vez' ? 'Sua vez: repita no clique' : null;

  return (
    <>
      <div className={css.areaBraco}>
        {aviso && (
          <p className={css.fase} role="status">
            {aviso}
          </p>
        )}
        {oculto ? (
          <div className={css.oculto}>Diagrama oculto: toque de ouvido</div>
        ) : (
          <Braco
            marcadores={exercicio.marcadores}
            {...(exercicio.sombra ? { sombra: exercicio.sombra } : {})}
            {...(exercicio.faixa ? { faixa: exercicio.faixa } : {})}
            tocandoAgora={fase === 'ouvindo' && tocandoAgora >= 0 ? tocandoAgora : null}
            aoTocarMarcador={(i) => {
              const m = exercicio.marcadores[i];
              if (m?.midi !== undefined) void audio.iniciar().then(() => audio.tocarNota(m.midi!));
            }}
            descricao={exercicio.titulo}
          />
        )}
      </div>
      <div className={css.controles}>
        <BarraReproducao
          bpm={bpm}
          aoMudarBpm={setBpm}
          aoTocar={tocar}
          compacta
          extra={
            <button className="btn" aria-pressed={oculto} onClick={() => setOculto(!oculto)}>
              {oculto ? 'Mostrar' : 'Ocultar'}
            </button>
          }
        />
      </div>
    </>
  );
}
