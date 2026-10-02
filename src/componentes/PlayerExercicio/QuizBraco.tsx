import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as audio from '../../audio/motor';
import { acertouToque } from '../../exercicios/mapa';
import type { PerguntaQuiz } from '../../exercicios/tipos';
import { useProgresso } from '../../estado/progresso';
import type { Marcador } from '../../teoria/marcador';
import {
  AFINACAO,
  croma,
  formatarNota,
  nomeSimples,
  notaNa,
  posicoesDe,
  TONS,
  type Corda,
} from '../../teoria/notas';
import type { Avaliacao } from '../../tipos';
import { Braco, type MarcaRetorno } from '../Braco';
import css from './PlayerExercicio.module.css';

export interface ResultadoQuiz {
  acertos: number;
  total: number;
  tempoMedio: number;
  sugerida: Avaliacao;
}

export function sugerirAvaliacao(acertos: number, total: number, tempoMedioSeg: number): Avaliacao {
  const taxa = total ? acertos / total : 0;
  if (taxa >= 0.875 && tempoMedioSeg <= 4) return 'limpo';
  if (taxa >= 0.625) return 'quase';
  return 'travou';
}

function tocarSeAtivo(midi: number) {
  if (audio.carregado()) audio.tocarNota(midi, 0.8);
}

interface Props {
  perguntas: PerguntaQuiz[];
  faixa?: [number, number];
  aoTerminar: (r: ResultadoQuiz) => void;
  aoMudarInstrucao: (texto: string) => void;
}

export function QuizBraco({ perguntas, aoTerminar, aoMudarInstrucao }: Props) {
  const { ajustes } = useProgresso();
  const revelarModo = ajustes.penseERevele;
  const [i, setI] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [tempos, setTempos] = useState<number[]>([]);
  const [retorno, setRetorno] = useState<MarcaRetorno[]>([]);
  const [escolhaErrada, setEscolhaErrada] = useState<number | null>(null);
  const [revelado, setRevelado] = useState(false);
  const [bloqueado, setBloqueado] = useState(false);
  const inicio = useRef(performance.now());
  const p = perguntas[i];
  const fim = i >= perguntas.length;

  const nome = (n: string) => formatarNota(n, ajustes.nomesNotas);

  useEffect(() => {
    if (!p) return;
    if (p.tipo === 'nome-do-ponto')
      aoMudarInstrucao(revelarModo ? 'Pense: que nota é esta?' : 'Que nota é esta?');
    else
      aoMudarInstrucao(
        `${revelarModo ? 'Pense onde está' : 'Toque'} ${nome(p.nota)}${p.corda ? ` na corda ${p.corda}` : ''}`,
      );
    inicio.current = performance.now();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, revelarModo]);

  const avancar = useCallback(
    (acertou: boolean, espera: number) => {
      const dt = (performance.now() - inicio.current) / 1000;
      setBloqueado(true);
      const novosAcertos = acertos + (acertou ? 1 : 0);
      const novosTempos = [...tempos, dt];
      setAcertos(novosAcertos);
      setTempos(novosTempos);
      window.setTimeout(() => {
        setRetorno([]);
        setEscolhaErrada(null);
        setRevelado(false);
        setBloqueado(false);
        const prox = i + 1;
        setI(prox);
        if (prox >= perguntas.length) {
          const media = novosTempos.reduce((s, t) => s + t, 0) / novosTempos.length;
          aoTerminar({
            acertos: novosAcertos,
            total: perguntas.length,
            tempoMedio: media,
            sugerida: sugerirAvaliacao(novosAcertos, perguntas.length, media),
          });
        }
      }, espera);
    },
    [acertos, tempos, i, perguntas.length, aoTerminar],
  );

  const marcadores = useMemo<Marcador[]>(() => {
    if (!p) return [];
    if (p.tipo === 'nome-do-ponto') {
      const n = notaNa(p.corda, p.casa);
      return [
        {
          corda: p.corda,
          casa: p.casa,
          midi: n.midi,
          papel: '3',
          semRotulo: !revelado && escolhaErrada === null,
        },
      ];
    }
    if (revelado || retorno.some((r) => r.tipo === 'errado')) {
      return posicoesDe(p.nota, p.faixa)
        .filter((x) => !p.corda || x.corda === p.corda)
        .map((x) => ({ ...x, papel: 'fundamental' as const, nota: p.nota }));
    }
    return [];
  }, [p, revelado, escolhaErrada, retorno]);

  if (fim || !p) {
    const media = tempos.length ? tempos.reduce((s, t) => s + t, 0) / tempos.length : 0;
    return (
      <div className={css.areaBraco}>
        <div className={css.resumoQuiz}>
          <p className={css.placar}>
            <span className="num">
              {acertos}/{perguntas.length}
            </span>{' '}
            certas
          </p>
          {!revelarModo && (
            <p className="mudo num">{media.toFixed(1).replace('.', ',')} s por resposta</p>
          )}
        </div>
      </div>
    );
  }

  const aoEscolherNome = (c: number) => {
    if (bloqueado || p.tipo !== 'nome-do-ponto') return;
    const certo = c === p.resposta;
    tocarSeAtivo(AFINACAO[p.corda] + p.casa);
    if (certo) {
      setRetorno([{ corda: p.corda, casa: p.casa, tipo: 'certo' }]);
      avancar(true, 500);
    } else {
      setEscolhaErrada(c);
      avancar(false, 1400);
    }
  };

  const aoTocarCasa = (corda: Corda, casa: number) => {
    if (bloqueado || p.tipo !== 'tocar-nota' || revelarModo) return;
    const certo = acertouToque(p, corda, casa);
    tocarSeAtivo(AFINACAO[corda] + casa);
    setRetorno([{ corda, casa, tipo: certo ? 'certo' : 'errado' }]);
    avancar(certo, certo ? 500 : 1500);
  };

  return (
    <>
      <div className={css.contador} aria-live="polite">
        <span className="num">
          {i + 1}/{perguntas.length}
        </span>
      </div>
      <div className={css.areaBraco}>
        <Braco
          marcadores={marcadores}
          rotulo="nota"
          retorno={retorno}
          aoTocar={p.tipo === 'tocar-nota' && !revelarModo ? aoTocarCasa : undefined}
          descricao={
            p.tipo === 'nome-do-ponto'
              ? `Ponto na corda ${p.corda}, casa ${p.casa}`
              : `Braço para tocar ${nome(p.nota)}`
          }
        />
      </div>
      <div className={css.controles}>
        {revelarModo ? (
          <div className={css.revelar}>
            {!revelado ? (
              <button className="btn btn-primario" onClick={() => setRevelado(true)}>
                Revelar
              </button>
            ) : (
              <>
                {p.tipo === 'nome-do-ponto' && (
                  <span className={css.resposta}>{nome(nomeSimples(p.resposta, true))}</span>
                )}
                <button className="btn btn-primario" onClick={() => avancar(true, 0)}>
                  Próxima
                </button>
              </>
            )}
          </div>
        ) : p.tipo === 'nome-do-ponto' ? (
          <div className={css.notas} role="group" aria-label="Escolha a nota">
            {TONS.map((t) => {
              const c = croma(t);
              const marcar =
                escolhaErrada !== null &&
                (c === escolhaErrada ? 'errada' : c === p.resposta ? 'certa' : '');
              return (
                <button
                  key={t}
                  className={`${css.nota} ${marcar ? css[marcar] : ''}`}
                  onClick={() => aoEscolherNome(c)}
                  disabled={bloqueado}
                >
                  {nome(t)}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </>
  );
}
