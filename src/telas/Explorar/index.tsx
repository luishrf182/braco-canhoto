import { useMemo, useState } from 'react';
import * as audio from '../../audio/motor';
import { BarraReproducao } from '../../componentes/BarraReproducao';
import { Braco, type Marcador } from '../../componentes/Braco';
import { SeletorTom } from '../../componentes/SeletorTom';
import { useTocandoAgora } from '../../estado/audio';
import { useProgresso } from '../../estado/progresso';
import type { EventoSequencia } from '../../exercicios/tipos';
import { acorde, QUALIDADES_TETRADE, type Qualidade } from '../../teoria/acordes';
import { arpejo } from '../../teoria/arpejos';
import { cifra } from '../../teoria/cifra';
import { posicaoEscala, type TipoEscala } from '../../teoria/escalas';
import { formatarNota, posicoesDe, type ClasseNota } from '../../teoria/notas';
import {
  FORMAS,
  FORMAS_TETRADE,
  marcadoresDoVoicing,
  voicing,
  type FormaCaged,
} from '../../teoria/voicings';
import css from './Explorar.module.css';

type Modo = 'notas' | 'acorde' | 'arpejo' | 'escala';

const MODOS: { valor: Modo; rotulo: string }[] = [
  { valor: 'acorde', rotulo: 'Acorde' },
  { valor: 'arpejo', rotulo: 'Arpejo' },
  { valor: 'escala', rotulo: 'Escala' },
  { valor: 'notas', rotulo: 'Notas' },
];

const QUALIDADES_ACORDE: Qualidade[] = [...QUALIDADES_TETRADE, '', 'm'];
const ROTULO_QUALIDADE = (q: Qualidade) => (q === '' ? 'maior' : q === 'm' ? 'menor' : q);
const ESCALAS: { valor: TipoEscala; rotulo: string }[] = [
  { valor: 'maior', rotulo: 'Maior' },
  { valor: 'penta-maior', rotulo: 'Penta maior' },
  { valor: 'penta-menor', rotulo: 'Penta menor' },
];

interface Vista {
  titulo: string;
  marcadores: Marcador[];
  faixa?: [number, number];
  sombra?: [number, number];
  eventos: EventoSequencia[];
}

function emOrdem(marcadores: Marcador[], sobeDesce = false): EventoSequencia[] {
  const ordem = marcadores
    .map((m, indice) => ({ m, indice }))
    .sort((a, b) => a.m.midi! - b.m.midi!)
    .map(({ m, indice }) => ({ midi: m.midi!, indice, duracao: 1 / 2 }));
  return sobeDesce ? [...ordem, ...ordem.slice(0, -1).reverse()] : ordem;
}

const janelaVista = (j: [number, number]): [number, number] =>
  j[0] === 0 ? [0, 5] : [j[0] - 1, Math.min(15, j[1] + 1)];

/** Consulta livre: qualquer tom, acorde, arpejo ou escala (estado inicial: C7M). */
export function Explorar() {
  const { ajustes } = useProgresso();
  const [modo, setModo] = useState<Modo>('acorde');
  const [tom, setTom] = useState<ClasseNota>('C');
  const [qualidade, setQualidade] = useState<Qualidade>('7M');
  const [forma, setForma] = useState<FormaCaged>('A');
  const [escala, setEscala] = useState<TipoEscala>('penta-menor');
  const [bpm, setBpm] = useState(80);
  const tocandoAgora = useTocandoAgora();

  const formasValidas: FormaCaged[] =
    modo === 'acorde' && QUALIDADES_TETRADE.includes(qualidade)
      ? FORMAS_TETRADE.map((f) => f.forma)
      : FORMAS;
  const formaAtual = formasValidas.includes(forma) ? forma : formasValidas[0]!;
  const qualidadesValidas = modo === 'arpejo' ? QUALIDADES_TETRADE : QUALIDADES_ACORDE;
  const qualidadeAtual = qualidadesValidas.includes(qualidade) ? qualidade : '7M';

  const vista = useMemo<Vista>(() => {
    if (modo === 'notas') {
      const marcadores = posicoesDe(tom).map((p) => ({
        ...p,
        papel: 'fundamental' as const,
        nota: tom,
      }));
      return {
        titulo: `Todas as notas ${formatarNota(tom, ajustes.nomesNotas)}`,
        marcadores,
        eventos: emOrdem(marcadores).map((e) => ({ ...e, duracao: 1 })),
      };
    }
    if (modo === 'acorde') {
      const v = voicing(tom, qualidadeAtual, formaAtual);
      const marcadores = marcadoresDoVoicing(v);
      return {
        titulo: `${cifra(acorde(tom, qualidadeAtual))} · forma de ${formaAtual}${v.abertura ? ` · abertura ${v.abertura}` : ''}`,
        marcadores,
        faixa: [v.faixa[0] === 0 ? 0 : v.faixa[0] - 1, Math.max(v.faixa[0] + 4, v.faixa[1] + 1)],
        eventos: [{ midi: marcadores.map((m) => m.midi!), duracao: 2 }, ...emOrdem(marcadores)],
      };
    }
    if (modo === 'arpejo') {
      const a = arpejo(tom, qualidadeAtual, formaAtual);
      return {
        titulo: `Arpejo de ${cifra(acorde(tom, qualidadeAtual))} · forma de ${formaAtual}`,
        marcadores: a.marcadores,
        faixa: janelaVista(a.janela),
        sombra: a.janela,
        eventos: emOrdem(a.marcadores, true),
      };
    }
    const p = posicaoEscala(tom, escala, formaAtual);
    const marcadores: Marcador[] = p.notas.map((n) => ({
      corda: n.corda,
      casa: n.casa,
      midi: n.midi,
      papel: n.grau === 1 ? 'fundamental' : 'escala',
      nota: n.nota,
      grau: String(n.grau),
    }));
    return {
      titulo: `${formatarNota(tom, ajustes.nomesNotas)} ${ESCALAS.find((e) => e.valor === escala)!.rotulo.toLowerCase()} · forma de ${formaAtual}`,
      marcadores,
      faixa: janelaVista(p.janela),
      sombra: p.janela,
      eventos: emOrdem(marcadores, true),
    };
  }, [modo, tom, qualidadeAtual, formaAtual, escala, ajustes.nomesNotas]);

  const mudar = (fn: () => void) => {
    audio.parar();
    fn();
  };

  return (
    <div className={css.tela}>
      <div className={css.cabecalho}>
        <h1>Explorar</h1>
        <div className={css.modos} role="group" aria-label="O que mostrar">
          {MODOS.map((m) => (
            <button
              key={m.valor}
              className="btn"
              aria-pressed={modo === m.valor}
              onClick={() => mudar(() => setModo(m.valor))}
            >
              {m.rotulo}
            </button>
          ))}
        </div>
      </div>

      <SeletorTom
        valor={tom}
        aoMudar={(t) => mudar(() => setTom(t))}
        rotulo={modo === 'notas' ? 'Nota' : 'Tom'}
      />

      {modo !== 'notas' && (
        <div className={css.opcoes}>
          {modo === 'escala' ? (
            <div className="linha" role="group" aria-label="Escala">
              {ESCALAS.map((e) => (
                <button
                  key={e.valor}
                  className="btn"
                  aria-pressed={escala === e.valor}
                  onClick={() => mudar(() => setEscala(e.valor))}
                >
                  {e.rotulo}
                </button>
              ))}
            </div>
          ) : (
            <div className="linha" role="group" aria-label="Qualidade">
              {qualidadesValidas.map((q) => (
                <button
                  key={q || 'maior'}
                  className="btn"
                  aria-pressed={qualidadeAtual === q}
                  onClick={() => mudar(() => setQualidade(q))}
                >
                  {ROTULO_QUALIDADE(q)}
                </button>
              ))}
            </div>
          )}
          <div className="linha" role="group" aria-label="Forma">
            {formasValidas.map((f) => (
              <button
                key={f}
                className="btn"
                aria-pressed={formaAtual === f}
                aria-label={`Forma de ${f}`}
                onClick={() => mudar(() => setForma(f))}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className={css.titulo}>{vista.titulo}</p>

      <div className={css.areaBraco}>
        <Braco
          marcadores={vista.marcadores}
          {...(vista.faixa ? { faixa: vista.faixa } : {})}
          {...(vista.sombra ? { sombra: vista.sombra } : {})}
          {...(modo === 'notas' ? { rotulo: 'nota' as const } : {})}
          tocandoAgora={tocandoAgora >= 0 ? tocandoAgora : null}
          aoTocarMarcador={(i) => {
            const m = vista.marcadores[i];
            if (m?.midi !== undefined) void audio.iniciar().then(() => audio.tocarNota(m.midi!));
          }}
          descricao={vista.titulo}
        />
      </div>
      <BarraReproducao
        bpm={bpm}
        aoMudarBpm={setBpm}
        aoTocar={() => audio.tocarSequencia(vista.eventos, { bpm, contagem: false })}
        compacta
      />
    </div>
  );
}
