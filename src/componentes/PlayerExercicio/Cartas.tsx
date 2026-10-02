import { useEffect, useRef, useState } from 'react';
import * as audio from '../../audio/motor';
import type { CartaIdentificacao } from '../../exercicios/tipos';
import { useProgresso } from '../../estado/progresso';
import { formatarTexto } from '../../teoria/notas';
import { Braco } from '../Braco';
import { sugerirAvaliacao, type ResultadoQuiz } from './QuizBraco';
import css from './PlayerExercicio.module.css';

interface Props {
  cartas: CartaIdentificacao[];
  aoTerminar: (r: ResultadoQuiz) => void;
  aoMudarInstrucao: (texto: string) => void;
}

/** Formato `identificacao`: cartas com 2–4 opções; no modo TV, pense e revele. */
export function Cartas({ cartas, aoTerminar, aoMudarInstrucao }: Props) {
  const { ajustes } = useProgresso();
  const revelarModo = ajustes.penseERevele;
  const [i, setI] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [tempos, setTempos] = useState<number[]>([]);
  const [escolha, setEscolha] = useState<string | null>(null);
  const [revelado, setRevelado] = useState(false);
  const inicio = useRef(performance.now());
  const c = cartas[i];

  useEffect(() => {
    if (c) aoMudarInstrucao(c.pergunta);
    inicio.current = performance.now();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  const tocar = () => {
    if (c?.midi?.length && audio.carregado()) audio.tocarNota(c.midi, 1.5);
  };

  const avancar = (acertou: boolean, espera: number) => {
    const dt = (performance.now() - inicio.current) / 1000;
    const novosAcertos = acertos + (acertou ? 1 : 0);
    const novosTempos = [...tempos, dt];
    setAcertos(novosAcertos);
    setTempos(novosTempos);
    window.setTimeout(() => {
      setEscolha(null);
      setRevelado(false);
      const prox = i + 1;
      setI(prox);
      if (prox >= cartas.length) {
        const media = novosTempos.reduce((s, t) => s + t, 0) / novosTempos.length;
        aoTerminar({
          acertos: novosAcertos,
          total: cartas.length,
          tempoMedio: media,
          sugerida: sugerirAvaliacao(novosAcertos, cartas.length, media),
        });
      }
    }, espera);
  };

  if (!c) {
    return (
      <div className={css.areaBraco}>
        <div className={css.resumoQuiz}>
          <p className={css.placar}>
            <span className="num">
              {acertos}/{cartas.length}
            </span>{' '}
            certas
          </p>
        </div>
      </div>
    );
  }

  const respondida = escolha !== null || revelado;

  return (
    <>
      <div className={css.contador} aria-live="polite">
        <span className="num">
          {i + 1}/{cartas.length}
        </span>
      </div>
      <div className={css.areaBraco}>
        {c.marcadores?.length ? (
          <Braco
            marcadores={c.marcadores.map((m) => ({
              ...m,
              semRotulo: !respondida,
              papelOculto: !respondida,
            }))}
            rotulo="grau"
            {...(c.faixa ? { faixa: c.faixa } : {})}
            aoTocarMarcador={(idx) => {
              const m = c.marcadores?.[idx];
              if (m?.midi !== undefined) void audio.iniciar().then(() => audio.tocarNota(m.midi!));
            }}
            descricao={c.pergunta}
          />
        ) : (
          <div className={css.cartaTexto}>{formatarTexto(c.pergunta, ajustes.nomesNotas)}</div>
        )}
      </div>
      <div className={css.controles}>
        {revelarModo ? (
          <div className={css.revelar}>
            {!revelado ? (
              <button
                className="btn btn-primario"
                onClick={() => {
                  setRevelado(true);
                  tocar();
                }}
              >
                Revelar
              </button>
            ) : (
              <>
                <span className={css.resposta}>{c.resposta}</span>
                <button className="btn btn-primario" onClick={() => avancar(true, 0)}>
                  Próxima
                </button>
              </>
            )}
          </div>
        ) : (
          <div className={css.opcoes} role="group" aria-label="Opções">
            {c.opcoes.map((o) => {
              const marca =
                escolha === null
                  ? ''
                  : o === c.resposta
                    ? css.certa
                    : o === escolha
                      ? css.errada
                      : '';
              return (
                <button
                  key={o}
                  className={`${css.opcao} ${marca}`}
                  disabled={escolha !== null}
                  onClick={() => {
                    setEscolha(o);
                    tocar();
                    const certo = o === c.resposta;
                    avancar(certo, certo ? 700 : 1600);
                  }}
                >
                  {o}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
