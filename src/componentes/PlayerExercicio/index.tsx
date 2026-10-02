import { useCallback, useState, type ReactNode } from 'react';
import * as audio from '../../audio/motor';
import type { ExercicioConcreto } from '../../exercicios/tipos';
import { useTocandoAgora } from '../../estado/audio';
import { useProgresso } from '../../estado/progresso';
import { formatarTexto } from '../../teoria/notas';
import type { Avaliacao as TAvaliacao } from '../../tipos';
import { Avaliacao } from '../Avaliacao';
import { BarraReproducao } from '../BarraReproducao';
import { Braco } from '../Braco';
import { Cartas } from './Cartas';
import { QuizBraco, type ResultadoQuiz } from './QuizBraco';
import css from './PlayerExercicio.module.css';

interface Props {
  exercicio: ExercicioConcreto;
  bpmInicial: number;
  /** "3 de 8" na sessão. */
  posicao?: string;
  aoAvaliar: (avaliacao: TAvaliacao, bpm: number) => void;
  aoSair: () => void;
  /** Quando presente, substitui a avaliação (tela pós-avaliação). */
  rodape?: ReactNode;
}

/** Player único para os formatos de exercício (BLUEPRINT §4.4). Tela sem rolagem. */
export function PlayerExercicio({
  exercicio,
  bpmInicial,
  posicao,
  aoAvaliar,
  aoSair,
  rodape,
}: Props) {
  const { ajustes } = useProgresso();
  const [bpm, setBpm] = useState(bpmInicial);
  const [instrucaoQuiz, setInstrucaoQuiz] = useState<string | null>(null);
  const [resultadoQuiz, setResultadoQuiz] = useState<ResultadoQuiz | null>(null);

  const instrucao = formatarTexto(instrucaoQuiz ?? exercicio.instrucao, ajustes.nomesNotas);
  const ehQuiz = exercicio.formato === 'quiz-braco' || exercicio.formato === 'identificacao';
  const podeAvaliar = !ehQuiz || resultadoQuiz !== null;

  const avaliar = useCallback(
    (a: TAvaliacao) => {
      audio.parar();
      aoAvaliar(a, bpm);
    },
    [aoAvaliar, bpm],
  );

  return (
    <main className={css.tela}>
      <header className={css.topo}>
        <button
          className="btn btn-fantasma"
          aria-label="Sair do exercício"
          onClick={() => {
            audio.parar();
            aoSair();
          }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className={css.icone}>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <span className={css.titulo}>{exercicio.titulo}</span>
        {posicao && <span className="rotulo num">{posicao}</span>}
      </header>

      <p className={css.instrucao}>{instrucao}</p>

      {exercicio.formato === 'identificacao' && exercicio.cartas ? (
        <Cartas
          key={exercicio.chave + exercicio.cartas.length}
          cartas={exercicio.cartas}
          aoTerminar={setResultadoQuiz}
          aoMudarInstrucao={setInstrucaoQuiz}
        />
      ) : ehQuiz && exercicio.quiz ? (
        <QuizBraco
          key={exercicio.chave + exercicio.quiz.length}
          perguntas={exercicio.quiz}
          aoTerminar={setResultadoQuiz}
          aoMudarInstrucao={setInstrucaoQuiz}
        />
      ) : (
        <VerTocar exercicio={exercicio} bpm={bpm} setBpm={setBpm} />
      )}

      <footer className={css.rodape}>
        {rodape ??
          (podeAvaliar && (
            <Avaliacao
              aoAvaliar={avaliar}
              {...(resultadoQuiz ? { sugerida: resultadoQuiz.sugerida } : {})}
            />
          ))}
      </footer>
    </main>
  );
}

function VerTocar({
  exercicio,
  bpm,
  setBpm,
}: {
  exercicio: ExercicioConcreto;
  bpm: number;
  setBpm: (b: number) => void;
}) {
  const tocandoAgora = useTocandoAgora();
  const [contagem, setContagem] = useState(true);
  const [comNotas, setComNotas] = useState(true);
  const temSequencia = !!exercicio.eventos?.length;
  const temGrau = exercicio.marcadores.some((m) => m.grau);
  const [rotulo, setRotulo] = useState<'grau' | 'nota'>('grau');

  const tocar = () => {
    if (!temSequencia || (!comNotas && exercicio.clique)) {
      audio.metronomo(bpm);
      return;
    }
    audio.tocarSequencia(exercicio.eventos!, {
      bpm,
      contagem,
      loop: !!exercicio.loop,
      clique: !!exercicio.clique,
    });
  };

  return (
    <>
      <div className={css.areaBraco}>
        <Braco
          marcadores={exercicio.marcadores}
          {...(exercicio.sombra ? { sombra: exercicio.sombra } : {})}
          {...(exercicio.faixa && exercicio.faixa[1] - exercicio.faixa[0] <= 6
            ? { faixa: exercicio.faixa }
            : {})}
          rotulo={temGrau ? rotulo : 'nota'}
          tocandoAgora={tocandoAgora >= 0 ? tocandoAgora : null}
          aoTocarMarcador={(i) => {
            const m = exercicio.marcadores[i];
            if (m?.midi !== undefined) void audio.iniciar().then(() => audio.tocarNota(m.midi!));
          }}
          descricao={exercicio.titulo}
        />
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
            temGrau ? (
              <button
                className="btn"
                onClick={() => setRotulo(rotulo === 'grau' ? 'nota' : 'grau')}
                aria-label={rotulo === 'grau' ? 'Mostrar notas' : 'Mostrar graus'}
              >
                {rotulo === 'grau' ? 'Graus' : 'Notas'}
              </button>
            ) : exercicio.clique && temSequencia ? (
              <button
                className="btn"
                aria-pressed={comNotas}
                onClick={() => setComNotas(!comNotas)}
              >
                {comNotas ? 'Com notas' : 'Só clique'}
              </button>
            ) : null
          }
        />
      </div>
    </>
  );
}
