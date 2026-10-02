import {
  acorde,
  papelDaFuncao,
  type Funcao,
  type Grau,
  type Qualidade,
  QUALIDADES_TETRADE,
} from './acordes';
import type { Marcador } from './marcador';
import { AFINACAO, CASA_MAX, croma, type ClasseNota, type Corda } from './notas';

export type FormaCaged = 'C' | 'A' | 'G' | 'E' | 'D';
export const FORMAS: FormaCaged[] = ['C', 'A', 'G', 'E', 'D'];

/** Apelido do material de referência: Desenho 1 = A, 2 = G, 3 = E, 4 = D, 5 = C. */
export const DESENHO: Record<FormaCaged, number> = { A: 1, G: 2, E: 3, D: 4, C: 5 };

/** Corda onde fica a tônica que dá nome à forma. */
export const CORDA_RAIZ: Record<FormaCaged, Corda> = { E: 6, A: 5, C: 5, G: 6, D: 4 };

interface CordaModelo {
  corda: Corda;
  funcao: Funcao;
  /**
   * Casa aproximada em relação à tônica da corda-raiz, no acorde maior de referência.
   * A casa real é a da nota do acorde mais próxima deste centro, então 3ª menor, 5ª diminuta
   * e as 7ªs caem no lugar certo sem tabela por qualidade.
   */
  centro: number;
}

/** Tríades maiores nas 5 formas (tiradas dos acordes abertos C, A, G, E, D). */
const TRIADES: Record<FormaCaged, CordaModelo[]> = {
  E: [
    { corda: 6, funcao: '1', centro: 0 },
    { corda: 5, funcao: '5', centro: 2 },
    { corda: 4, funcao: '1', centro: 2 },
    { corda: 3, funcao: '3', centro: 1 },
    { corda: 2, funcao: '5', centro: 0 },
    { corda: 1, funcao: '1', centro: 0 },
  ],
  A: [
    { corda: 5, funcao: '1', centro: 0 },
    { corda: 4, funcao: '5', centro: 2 },
    { corda: 3, funcao: '1', centro: 2 },
    { corda: 2, funcao: '3', centro: 2 },
    { corda: 1, funcao: '5', centro: 0 },
  ],
  C: [
    { corda: 5, funcao: '1', centro: 0 },
    { corda: 4, funcao: '3', centro: -1 },
    { corda: 3, funcao: '5', centro: -3 },
    { corda: 2, funcao: '1', centro: -2 },
    { corda: 1, funcao: '3', centro: -3 },
  ],
  G: [
    { corda: 6, funcao: '1', centro: 0 },
    { corda: 5, funcao: '3', centro: -1 },
    { corda: 4, funcao: '5', centro: -3 },
    { corda: 3, funcao: '1', centro: -3 },
    { corda: 2, funcao: '3', centro: -3 },
    { corda: 1, funcao: '1', centro: 0 },
  ],
  D: [
    { corda: 4, funcao: '1', centro: 0 },
    { corda: 3, funcao: '5', centro: 2 },
    { corda: 2, funcao: '1', centro: 3 },
    { corda: 1, funcao: '3', centro: 2 },
  ],
};

export type Abertura = 1 | 2;

/**
 * Tétrades (BLUEPRINT §3, Módulo 1):
 * Abertura 1 — na pestana a ordem é T-5-8-3; a 8ª vira 7ª (formas de A e D).
 * Abertura 2 — forma de E: T-7-3-5 (a 7ª na 4ª corda, a 5ª no agudo), com a 5ª corda muda.
 */
const TETRADES: { forma: FormaCaged; abertura: Abertura; cordas: CordaModelo[] }[] = [
  {
    forma: 'A',
    abertura: 1,
    cordas: [
      { corda: 5, funcao: '1', centro: 0 },
      { corda: 4, funcao: '5', centro: 2 },
      { corda: 3, funcao: '7', centro: 0.5 },
      { corda: 2, funcao: '3', centro: 2 },
    ],
  },
  {
    forma: 'D',
    abertura: 1,
    cordas: [
      { corda: 4, funcao: '1', centro: 0 },
      { corda: 3, funcao: '5', centro: 2 },
      { corda: 2, funcao: '7', centro: 1.5 },
      { corda: 1, funcao: '3', centro: 2 },
    ],
  },
  {
    forma: 'E',
    abertura: 2,
    cordas: [
      { corda: 6, funcao: '1', centro: 0 },
      { corda: 4, funcao: '7', centro: 0.5 },
      { corda: 3, funcao: '3', centro: 1 },
      { corda: 2, funcao: '5', centro: 0 },
    ],
  },
];

/** Formas e aberturas em que existe voicing de tétrade. */
export const FORMAS_TETRADE: { forma: FormaCaged; abertura: Abertura }[] = TETRADES.map(
  ({ forma, abertura }) => ({ forma, abertura }),
);

export function aberturaPadrao(forma: FormaCaged): Abertura | undefined {
  return TETRADES.find((t) => t.forma === forma)?.abertura;
}

export interface PosicaoVoicing {
  corda: Corda;
  casa: number;
  midi: number;
  croma: number;
  nota: ClasseNota;
  grau: Grau;
  funcao: Funcao;
  intervalo: string;
}

export interface Voicing {
  fundamental: ClasseNota;
  qualidade: Qualidade;
  forma: FormaCaged;
  abertura?: Abertura;
  posicoes: PosicaoVoicing[];
  /** Menor e maior casa usada (casas soltas contam como 0). */
  faixa: [number, number];
}

export interface OpcoesVoicing {
  abertura?: Abertura;
  /** Omite a ocorrência mais grave destas funções (ex.: ['1'] = sem tônica no baixo). */
  omitir?: Funcao[];
  /** Procura a forma a partir desta casa (para tocar em outra região do braço). */
  casaMin?: number;
}

const ehTetrade = (q: Qualidade) => QUALIDADES_TETRADE.includes(q);

function modeloDe(q: Qualidade, forma: FormaCaged, abertura?: Abertura) {
  if (!ehTetrade(q)) return { cordas: TRIADES[forma], abertura: undefined };
  const t = TETRADES.find(
    (x) => x.forma === forma && (abertura === undefined || x.abertura === abertura),
  );
  if (!t)
    throw new Error(
      `Sem voicing de tétrade na forma de ${forma}${abertura ? ` (abertura ${abertura})` : ''}`,
    );
  return { cordas: t.cordas, abertura: t.abertura };
}

/** Voicing de um acorde numa forma CAGED, calculado a partir da afinação. */
export function voicing(
  fundamental: ClasseNota,
  q: Qualidade,
  forma: FormaCaged,
  opc: OpcoesVoicing = {},
): Voicing {
  const info = acorde(fundamental, q);
  const { cordas, abertura } = modeloDe(q, forma, opc.abertura);
  const porFuncao = new Map(info.notas.map((n) => [n.funcao, n]));
  const raiz = CORDA_RAIZ[forma];
  const cRaiz = croma(fundamental);
  const casaRaiz0 = (((cRaiz - AFINACAO[raiz]) % 12) + 12) % 12;

  for (let ancora = casaRaiz0; ancora <= CASA_MAX; ancora += 12) {
    if (ancora < (opc.casaMin ?? 0)) continue;
    const posicoes: PosicaoVoicing[] = [];
    let valido = true;
    for (const m of cordas) {
      const n = porFuncao.get(m.funcao);
      if (!n) {
        valido = false;
        break;
      }
      const alvo = (cRaiz + n.semitons) % 12;
      const base = (((alvo - AFINACAO[m.corda]) % 12) + 12) % 12;
      const centro = ancora + m.centro;
      // Candidatos: base−12, base, base+12... escolhe o mais próximo do centro.
      let casa = base - 12;
      for (let c = base; c <= CASA_MAX + 12; c += 12) {
        if (Math.abs(c - centro) < Math.abs(casa - centro)) casa = c;
      }
      if (casa < 0 || casa > CASA_MAX) {
        valido = false;
        break;
      }
      posicoes.push({
        corda: m.corda,
        casa,
        midi: AFINACAO[m.corda] + casa,
        croma: alvo,
        nota: n.nota,
        grau: n.grau,
        funcao: n.funcao,
        intervalo: n.nomeIntervalo,
      });
    }
    if (!valido) continue;
    let finais = posicoes;
    for (const f of opc.omitir ?? []) {
      const grave = finais.filter((p) => p.funcao === f).sort((a, b) => a.midi - b.midi)[0];
      if (grave) finais = finais.filter((p) => p !== grave);
    }
    const casas = finais.map((p) => p.casa);
    return {
      fundamental: info.fundamental,
      qualidade: q,
      forma,
      ...(abertura ? { abertura } : {}),
      posicoes: finais,
      faixa: [Math.min(...casas), Math.max(...casas)],
    };
  }
  // A forma pedida não coube a partir de casaMin: tenta do início do braço.
  if (opc.casaMin) return voicing(fundamental, q, forma, { ...opc, casaMin: 0 });
  throw new Error(`Voicing fora do braço: ${fundamental}${q} forma de ${forma}`);
}

/** Converte um voicing em marcadores para o Braço. */
export function marcadoresDoVoicing(v: Voicing): Marcador[] {
  return v.posicoes
    .slice()
    .sort((a, b) => b.corda - a.corda)
    .map((p) => ({
      corda: p.corda,
      casa: p.casa,
      midi: p.midi,
      papel: papelDaFuncao(p.funcao),
      nota: p.nota,
      grau: p.grau,
      intervalo: p.intervalo,
    }));
}

/** Janela de 5 casas para mostrar o voicing (JanelaAcorde). */
export function janelaDoVoicing(v: Voicing, tamanho = 5): [number, number] {
  const [min, max] = v.faixa;
  if (min === 0) return [0, Math.max(tamanho - 1, max)];
  return [min, Math.max(min + tamanho - 1, max)];
}
