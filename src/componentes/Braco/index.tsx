import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import { useProgresso } from '../../estado/progresso';
import { CASA_MAX, CORDAS, formatarNota, notaNa, type Corda } from '../../teoria/notas';
import type { Marcador, Papel } from '../../teoria/marcador';

export type { Marcador, Papel };
import { useCompacto } from './useCompacto';
import css from './Braco.module.css';

export type ModoRotulo = 'nota' | 'grau' | 'intervalo' | 'dedo' | 'nenhum';

export interface MarcaRetorno {
  corda: Corda;
  casa: number;
  tipo: 'certo' | 'errado';
}

export interface PropsBraco {
  marcadores: Marcador[];
  /** Faixa forçada (JanelaAcorde). Sem ela: 0–15 em paisagem, janela automática em retrato. */
  faixa?: [number, number];
  rotulo?: ModoRotulo;
  /** Índice do marcador que está soando agora (destaque sincronizado com o áudio). */
  tocandoAgora?: number | null;
  /** Casas sombreadas (forma CAGED). */
  sombra?: [number, number] | null;
  /** Toque numa casa qualquer (quiz). */
  aoTocar?: (corda: Corda, casa: number) => void;
  /** Toque num marcador (tocar a nota). */
  aoTocarMarcador?: (indice: number) => void;
  retorno?: MarcaRetorno[];
  mostrarCordas?: boolean;
  /** Tamanho da janela em retrato (5 a 7). */
  janela?: number;
  /** Força os espelhos (pré-visualização); por padrão vêm dos ajustes. */
  espelho?: { horizontal: boolean; vertical: boolean };
  descricao: string;
}

// Unidades do desenho (o SVG escala para a largura disponível).
const W = 48; // largura de uma casa
const W0 = 34; // coluna das cordas soltas
const G = 34; // distância entre cordas
const M_TOPO = 16;
const M_BASE = 26;
const M_LADO = 12;
const W_NOMES = 20;
const R = 13.5;
const INLAYS = [3, 5, 7, 9, 15];

function textoDo(m: Marcador, modo: ModoRotulo, sistema: 'letras' | 'do-re-mi'): string {
  if (m.semRotulo || modo === 'nenhum') return '';
  switch (modo) {
    case 'grau':
      return m.grau ?? '';
    case 'intervalo':
      return m.intervalo ?? m.grau ?? '';
    case 'dedo':
      return m.dedo !== undefined ? String(m.dedo) : '';
    default:
      return formatarNota(m.nota ?? notaNa(m.corda, m.casa).nome, sistema);
  }
}

function forma(papel: Papel, x: number, y: number, r: number): JSX.Element {
  switch (papel) {
    case 'fundamental':
      return <rect x={x - r} y={y - r} width={2 * r} height={2 * r} rx={3} />;
    case '5': {
      const pts = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 3) * i;
        return `${x + r * 1.08 * Math.cos(a)},${y + r * 1.08 * Math.sin(a)}`;
      }).join(' ');
      return <polygon points={pts} />;
    }
    case '7': {
      const d = r * 1.3;
      return <polygon points={`${x},${y - d} ${x + d},${y} ${x},${y + d} ${x - d},${y}`} />;
    }
    case 'extensao': {
      const d = r * 1.15;
      return <polygon points={`${x - d},${y - d * 0.8} ${x + d},${y - d * 0.8} ${x},${y + d}`} />;
    }
    case 'escala':
      return <circle cx={x} cy={y} r={r * 0.8} />;
    default:
      return <circle cx={x} cy={y} r={r} />;
  }
}

function papelVisivel(m: Marcador): Papel {
  return m.papelOculto && m.papel !== 'fundamental' ? 'escala' : m.papel;
}

/** Calcula a faixa visível. Em retrato: janela de 5–7 casas, com paginação se precisar. */
function faixaNecessaria(marcadores: Marcador[]): [number, number] {
  if (!marcadores.length) return [0, CASA_MAX];
  const casas = marcadores.map((m) => m.casa);
  return [Math.min(...casas), Math.max(...casas)];
}

export function Braco({
  marcadores,
  faixa,
  rotulo,
  tocandoAgora = null,
  sombra = null,
  aoTocar,
  aoTocarMarcador,
  retorno = [],
  mostrarCordas = true,
  janela = 7,
  espelho,
  descricao,
}: PropsBraco) {
  const { ajustes } = useProgresso();
  const compacto = useCompacto();
  const espelhoH = espelho?.horizontal ?? ajustes.espelhoHorizontal;
  const espelhoV = espelho?.vertical ?? ajustes.espelhoVertical;
  const modo = rotulo ?? ajustes.rotulo;

  const [nMin, nMax] = useMemo(() => faixaNecessaria(marcadores), [marcadores]);
  const tamJanela = Math.max(5, Math.min(7, janela));
  const precisaPaginar = !faixa && compacto && nMax - nMin + 1 > tamJanela;

  const inicioIdeal = useMemo(() => {
    if (!compacto || faixa) return 0;
    const centro = Math.floor((nMin + Math.min(nMax, nMin + tamJanela - 1)) / 2);
    return Math.max(0, Math.min(CASA_MAX - tamJanela + 1, centro - Math.floor(tamJanela / 2)));
  }, [compacto, faixa, nMin, nMax, tamJanela]);

  const [inicio, setInicio] = useState(inicioIdeal);
  useEffect(() => setInicio(inicioIdeal), [inicioIdeal]);

  // A janela acompanha a nota que está soando quando ela sai da tela.
  const casaTocando = tocandoAgora !== null ? marcadores[tocandoAgora]?.casa : undefined;
  useEffect(() => {
    if (!compacto || faixa || casaTocando === undefined) return;
    setInicio((s) => {
      const f = s + tamJanela - 1;
      if (casaTocando >= s && casaTocando <= f) return s;
      return Math.max(0, Math.min(CASA_MAX - tamJanela + 1, casaTocando - 1));
    });
  }, [casaTocando, compacto, faixa, tamJanela]);

  const [ini, fim]: [number, number] = faixa
    ? faixa
    : compacto
      ? [inicio, Math.min(CASA_MAX, inicio + tamJanela - 1)]
      : [0, CASA_MAX];

  // Colunas em ordem lógica (casa crescente) e suas larguras.
  const colunas: { casa: number; w: number }[] = [];
  for (let c = ini; c <= fim; c++) colunas.push({ casa: c, w: c === 0 ? W0 : W });
  const larguraCasas = colunas.reduce((s, c) => s + c.w, 0);
  const extraNomes = mostrarCordas ? W_NOMES : 0;
  const larguraTotal = M_LADO * 2 + extraNomes + larguraCasas;
  const alturaTotal = M_TOPO + 5 * G + M_BASE;

  // ===== Regra de espelho: ÚNICO lugar do app que transforma coordenadas. =====
  // Lógico: x cresce com a casa a partir da pestana; y = corda - 1 (mi agudo em cima).
  // x = espelhoH ? (casaMax - casa) : casa ;  y = espelhoV ? (6 - corda) : (corda - 1)
  const inicioCasas = M_LADO + extraNomes;
  const bordaEsq = new Map<number, number>();
  {
    let acc = inicioCasas;
    for (const c of colunas) {
      bordaEsq.set(c.casa, acc);
      acc += c.w;
    }
  }
  const espelharX = (x: number) => (espelhoH ? larguraTotal - x : x);
  const xCentro = (casa: number) => {
    const e = bordaEsq.get(casa);
    const col = colunas.find((c) => c.casa === casa);
    if (e === undefined || !col) return NaN;
    return espelharX(e + col.w / 2);
  };
  /** Posição do traste à direita (lógica) da casa. */
  const xTraste = (casa: number) => {
    const e = bordaEsq.get(casa);
    const col = colunas.find((c) => c.casa === casa);
    if (e === undefined || !col) return NaN;
    return espelharX(e + col.w);
  };
  const yCorda = (corda: Corda) => M_TOPO + (espelhoV ? 6 - corda : corda - 1) * G;
  // ============================================================================

  const yMeio = M_TOPO + 2.5 * G;
  const xNomes = espelharX(M_LADO + W_NOMES / 2);
  const xEsqPrimeira = espelharX(inicioCasas);

  const visiveis = marcadores
    .map((m, i) => ({ m, i }))
    .filter(({ m }) => m.casa >= ini && m.casa <= fim);

  const deslocar = (dirVisual: -1 | 1) => {
    const delta = (espelhoH ? -dirVisual : dirVisual) * (tamJanela - 2);
    setInicio((s) => Math.max(0, Math.min(CASA_MAX - tamJanela + 1, s + delta)));
  };
  const podeMenos = inicio > 0;
  const podeMais = fim < CASA_MAX;
  // Botão da esquerda leva às casas que estão visualmente à esquerda.
  const esqHabilitado = espelhoH ? podeMais : podeMenos;
  const dirHabilitado = espelhoH ? podeMenos : podeMais;

  return (
    <div className={css.braco}>
      <svg
        viewBox={`0 0 ${larguraTotal} ${alturaTotal}`}
        className={css.svg}
        role={aoTocar ? 'group' : 'img'}
        aria-label={descricao}
        preserveAspectRatio="xMidYMid meet"
      >
        {sombra && (
          <rect
            className={css.sombra}
            x={Math.min(
              espelharX(bordaEsq.get(Math.max(ini, sombra[0])) ?? inicioCasas),
              xTraste(Math.min(fim, sombra[1])),
            )}
            y={M_TOPO - G / 2}
            width={Math.abs(
              xTraste(Math.min(fim, sombra[1])) -
                espelharX(bordaEsq.get(Math.max(ini, sombra[0])) ?? inicioCasas),
            )}
            height={5 * G + G}
            rx={8}
          />
        )}

        {/* Marcas de posição */}
        {colunas
          .filter((c) => INLAYS.includes(c.casa))
          .map((c) => (
            <circle
              key={'in' + c.casa}
              className={css.inlay}
              cx={xCentro(c.casa)}
              cy={yMeio}
              r={5}
            />
          ))}
        {ini <= 12 && fim >= 12 && (
          <>
            <circle className={css.inlay} cx={xCentro(12)} cy={M_TOPO + 1.5 * G} r={5} />
            <circle className={css.inlay} cx={xCentro(12)} cy={M_TOPO + 3.5 * G} r={5} />
          </>
        )}

        {/* Trastes */}
        {ini > 0 && (
          <line
            className={css.traste}
            x1={xEsqPrimeira}
            x2={xEsqPrimeira}
            y1={M_TOPO}
            y2={M_TOPO + 5 * G}
          />
        )}
        {colunas.map((c) => (
          <line
            key={'t' + c.casa}
            className={c.casa === 0 ? css.pestana : css.traste}
            x1={xTraste(c.casa)}
            x2={xTraste(c.casa)}
            y1={M_TOPO - (c.casa === 0 ? 2 : 0)}
            y2={M_TOPO + 5 * G + (c.casa === 0 ? 2 : 0)}
          />
        ))}

        {/* Cordas */}
        {CORDAS.map((corda) => (
          <line
            key={'c' + corda}
            className={css.corda}
            style={{ strokeWidth: 0.8 + (corda - 1) * 0.35 }}
            x1={espelharX(inicioCasas)}
            x2={espelharX(inicioCasas + larguraCasas)}
            y1={yCorda(corda)}
            y2={yCorda(corda)}
          />
        ))}

        {/* Nomes das cordas soltas */}
        {mostrarCordas &&
          CORDAS.map((corda) => (
            <text
              key={'n' + corda}
              className={css.nomeCorda}
              x={xNomes}
              y={yCorda(corda)}
              dominantBaseline="central"
              textAnchor="middle"
            >
              {formatarNota(notaNa(corda, 0).nome, ajustes.nomesNotas)}
            </text>
          ))}

        {/* Números das casas */}
        {colunas
          .filter(
            (c) =>
              c.casa > 0 &&
              (compacto || faixa || [1, 3, 5, 7, 9, 12, 15].includes(c.casa) || c.casa === ini),
          )
          .map((c) => (
            <text
              key={'num' + c.casa}
              className={css.numero}
              x={xCentro(c.casa)}
              y={M_TOPO + 5 * G + 19}
              textAnchor="middle"
            >
              {c.casa}
            </text>
          ))}

        {/* Áreas de toque (quiz) */}
        {aoTocar &&
          CORDAS.flatMap((corda) =>
            colunas.map((c) => (
              <rect
                key={`a${corda}-${c.casa}`}
                className={css.alvo}
                x={Math.min(espelharX(bordaEsq.get(c.casa)!), xTraste(c.casa))}
                y={yCorda(corda) - G / 2}
                width={c.w}
                height={G}
                role="button"
                tabIndex={0}
                aria-label={`Corda ${corda}, casa ${c.casa}`}
                onClick={() => aoTocar(corda, c.casa)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    aoTocar(corda, c.casa);
                  }
                }}
              />
            )),
          )}

        {/* Marcadores */}
        {visiveis.map(({ m, i }) => {
          const x = xCentro(m.casa);
          const y = yCorda(m.corda);
          const texto = textoDo(m, modo, ajustes.nomesNotas);
          const ativo = tocandoAgora === i;
          const fonte = texto.length > 2 ? 10.5 : texto.length > 1 ? 12 : 13.5;
          return (
            <g
              key={`m${i}-${m.corda}-${m.casa}`}
              className={[
                css.marcador,
                css['p' + papelVisivel(m).replace(/\W/g, '')] ?? '',
                m.fantasma ? css.fantasma : '',
                ativo ? css.ativo : '',
                aoTocarMarcador ? css.clicavel : '',
              ].join(' ')}
              onClick={aoTocarMarcador ? () => aoTocarMarcador(i) : undefined}
              {...(aoTocarMarcador
                ? {
                    role: 'button',
                    tabIndex: 0,
                    'aria-label': `Corda ${m.corda}, casa ${m.casa}${texto ? ': ' + texto : ''}`,
                    onKeyDown: (e: KeyboardEvent<SVGGElement>) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        aoTocarMarcador(i);
                      }
                    },
                  }
                : {})}
              style={{ transformOrigin: `${x}px ${y}px` }}
            >
              {ativo && <circle className={css.anel} cx={x} cy={y} r={R + 6} />}
              {forma(papelVisivel(m), x, y, R)}
              {texto && (
                <text
                  x={x}
                  y={y}
                  dominantBaseline="central"
                  textAnchor="middle"
                  style={{ fontSize: fonte }}
                >
                  {texto}
                </text>
              )}
            </g>
          );
        })}

        {/* Retorno do quiz */}
        {retorno
          .filter((r) => r.casa >= ini && r.casa <= fim)
          .map((r) => (
            <g key={`r${r.corda}-${r.casa}`} className={css[r.tipo]}>
              <circle cx={xCentro(r.casa)} cy={yCorda(r.corda)} r={R} />
              <text
                x={xCentro(r.casa)}
                y={yCorda(r.corda)}
                dominantBaseline="central"
                textAnchor="middle"
              >
                {r.tipo === 'certo' ? '✓' : '✕'}
              </text>
            </g>
          ))}
      </svg>

      {precisaPaginar && (
        <div className={css.paginacao}>
          <button
            className="btn btn-fantasma"
            aria-label="Ver casas à esquerda"
            disabled={!esqHabilitado}
            onClick={() => deslocar(-1)}
          >
            ‹
          </button>
          <span className="rotulo num">
            casas {ini}–{fim}
          </span>
          <button
            className="btn btn-fantasma"
            aria-label="Ver casas à direita"
            disabled={!dirHabilitado}
            onClick={() => deslocar(1)}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
