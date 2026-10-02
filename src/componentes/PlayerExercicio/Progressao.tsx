import { useState } from 'react';
import * as audio from '../../audio/motor';
import { LEVADAS, NOMES_LEVADA, type NomeLevada } from '../../audio/levadas';
import type { ExercicioConcreto } from '../../exercicios/tipos';
import { useTocandoAgora } from '../../estado/audio';
import { BarraReproducao } from '../BarraReproducao';
import { Braco } from '../Braco';
import css from './PlayerExercicio.module.css';

/** Formato `progressao`: base em loop; o acorde atual fica destacado e aparece no braço. */
export function Progressao({
  exercicio,
  bpm,
  setBpm,
}: {
  exercicio: ExercicioConcreto;
  bpm: number;
  setBpm: (b: number) => void;
}) {
  const passos = exercicio.progressao ?? [];
  const tocando = useTocandoAgora();
  const [escolhido, setEscolhido] = useState(0);
  const [levada, setLevada] = useState<NomeLevada | 'nenhuma'>(exercicio.levada ?? 'nenhuma');
  const [pad, setPad] = useState(true);
  const [contagem, setContagem] = useState(true);
  const atual = tocando >= 0 && tocando < passos.length ? tocando : escolhido;
  const passo = passos[atual];

  const tocar = () =>
    audio.iniciarBase({
      acordes: passos.map((p) => ({ midi: p.midi, baixo: p.baixo })),
      batidasPorAcorde: passos[0]?.tempos ?? 4,
      levada,
      bpm,
      pad,
      clique: levada === 'nenhuma',
      contagem,
    });

  // Mudar a levada ou o pad durante a execução reinicia a base.
  const reiniciarSe = (fn: () => void) => {
    fn();
    if (audio.estadoAtual() === 'tocando') window.setTimeout(tocar, 0);
  };

  return (
    <>
      <ol className={css.cifras} aria-label="Acordes da progressão">
        {passos.map((p, i) => (
          <li key={i}>
            <button
              className={css.cifraPasso}
              aria-current={i === atual ? 'step' : undefined}
              onClick={() => {
                setEscolhido(i);
                void audio.iniciar().then(() => {
                  if (audio.estadoAtual() !== 'tocando') audio.tocarNota(p.midi, 1.5);
                });
              }}
            >
              <strong>{p.cifra}</strong>
              <span>{p.grau}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className={css.areaBraco}>
        {passo && (
          <Braco
            marcadores={passo.marcadores}
            faixa={[
              Math.max(0, passo.faixa[0] - 1),
              Math.max(passo.faixa[0] + 4, passo.faixa[1] + 1),
            ]}
            aoTocarMarcador={(i) => {
              const m = passo.marcadores[i];
              if (m?.midi !== undefined) void audio.iniciar().then(() => audio.tocarNota(m.midi!));
            }}
            descricao={`${passo.cifra}, acorde ${atual + 1} de ${passos.length}`}
          />
        )}
      </div>
      <div className={css.controles}>
        <BarraReproducao
          bpm={bpm}
          aoMudarBpm={setBpm}
          aoTocar={tocar}
          contagem={contagem}
          aoMudarContagem={setContagem}
          compacta
          extra={
            <>
              <label className={css.levada}>
                <span className="visualmente-oculto">Levada</span>
                <select
                  value={levada}
                  onChange={(e) =>
                    reiniciarSe(() => setLevada(e.target.value as NomeLevada | 'nenhuma'))
                  }
                >
                  <option value="nenhuma">Sem bateria</option>
                  {NOMES_LEVADA.map((n) => (
                    <option key={n} value={n}>
                      {LEVADAS[n].rotulo}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="btn"
                aria-pressed={pad}
                onClick={() => reiniciarSe(() => setPad(!pad))}
              >
                Pad
              </button>
            </>
          }
        />
      </div>
    </>
  );
}
