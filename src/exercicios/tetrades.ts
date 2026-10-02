import { embaralhar, escolher } from './aleatorio';
import {
  BPM_PADRAO,
  chaveItem,
  type CartaIdentificacao,
  type ContextoGeracao,
  type ExercicioConcreto,
  type ModeloExercicio,
  type PerguntaQuiz,
} from './tipos';
import { acorde, QUALIDADES_TETRADE, type Funcao, type Qualidade } from '../teoria/acordes';
import { cifra } from '../teoria/cifra';
import type { Marcador } from '../teoria/marcador';
import {
  aberturaPadrao,
  FORMAS_TETRADE,
  janelaDoVoicing,
  marcadoresDoVoicing,
  voicing,
  type FormaCaged,
} from '../teoria/voicings';

const NOME_FUNCAO: Record<Funcao, string> = { '1': 'tônica', '3': '3ª', '5': '5ª', '7': '7ª' };

function formaDo(ctx: ContextoGeracao): FormaCaged {
  return ctx.forma ?? 'A';
}

function descricaoForma(forma: FormaCaged): string {
  const ab = aberturaPadrao(forma);
  return `forma de ${forma}${ab ? ` · abertura ${ab}` : ''}`;
}

/** Ver e tocar uma tétrade: acorde inteiro, depois nota a nota da grave para a aguda. */
export function verTetrade(modelo: ModeloExercicio, ctx: ContextoGeracao): ExercicioConcreto {
  const forma = formaDo(ctx);
  const q =
    (modelo.params.qualidade as Qualidade | undefined) ?? escolher(QUALIDADES_TETRADE, ctx.rnd);
  const omitir = modelo.params.omitir as Funcao[] | undefined;
  const v = voicing(ctx.tom, q, forma, omitir ? { omitir } : {});
  const marcadores = marcadoresDoVoicing(v);
  const ordem = marcadores.map((m, i) => ({ m, i })).sort((a, b) => a.m.midi! - b.m.midi!);
  const nome = cifra(acorde(ctx.tom, q));
  return {
    chave: chaveItem(modelo.id, ctx.tom, forma),
    modeloId: modelo.id,
    formato: 'ver-tocar',
    titulo: modelo.titulo,
    tom: ctx.tom,
    forma,
    instrucao: `${nome} · ${descricaoForma(forma)}${omitir?.length ? ` · sem ${omitir.map((f) => NOME_FUNCAO[f]).join(' e ')}` : ''}`,
    marcadores,
    faixa: janelaDoVoicing(v),
    eventos: [
      { midi: ordem.map(({ m }) => m.midi!), duracao: 2 },
      ...ordem.map(({ m, i }) => ({ midi: m.midi!, indice: i })),
    ],
    bpm: modelo.bpm ?? BPM_PADRAO,
  };
}

/** Cartas: "que acorde é este?" — o voicing aparece sem rótulos. */
export function identificarTetrade(
  modelo: ModeloExercicio,
  ctx: ContextoGeracao,
): ExercicioConcreto {
  const rodadas = (modelo.params.rodadas as number) ?? 6;
  const qualidades = embaralhar(QUALIDADES_TETRADE, ctx.rnd);
  while (qualidades.length < rodadas) qualidades.push(escolher(QUALIDADES_TETRADE, ctx.rnd));
  const cartas: CartaIdentificacao[] = qualidades.slice(0, rodadas).map((q) => {
    const { forma } = escolher(FORMAS_TETRADE, ctx.rnd);
    const v = voicing(ctx.tom, q, forma);
    const certa = cifra(acorde(ctx.tom, q));
    const outras = embaralhar(
      QUALIDADES_TETRADE.filter((x) => x !== q),
      ctx.rnd,
    )
      .slice(0, 3)
      .map((x) => cifra(acorde(ctx.tom, x)));
    return {
      pergunta: 'Que acorde é este?',
      opcoes: embaralhar([certa, ...outras], ctx.rnd),
      resposta: certa,
      marcadores: marcadoresDoVoicing(v).map((m) => ({ ...m, semRotulo: true, papelOculto: true })),
      midi: v.posicoes.map((p) => p.midi).sort((a, b) => a - b),
      faixa: janelaDoVoicing(v),
    };
  });
  return {
    chave: chaveItem(modelo.id, ctx.tom, '-'),
    modeloId: modelo.id,
    formato: 'identificacao',
    titulo: modelo.titulo,
    tom: ctx.tom,
    forma: '-',
    instrucao: 'Que acorde é este?',
    marcadores: [],
    cartas,
    bpm: BPM_PADRAO,
  };
}

/** Quiz: "onde está a 7ª?" — toque o ponto certo no voicing. */
export function ondeEstaGrau(modelo: ModeloExercicio, ctx: ContextoGeracao): ExercicioConcreto {
  const rodadas = (modelo.params.rodadas as number) ?? 6;
  const funcoes = (modelo.params.funcoes as Funcao[] | undefined) ?? ['7'];
  const perguntas: PerguntaQuiz[] = [];
  for (let i = 0; i < rodadas; i++) {
    const q = escolher(QUALIDADES_TETRADE, ctx.rnd);
    const { forma } = escolher(FORMAS_TETRADE, ctx.rnd);
    const funcao = escolher(funcoes, ctx.rnd);
    const v = voicing(ctx.tom, q, forma);
    const marcadores: Marcador[] = marcadoresDoVoicing(v).map((m) => ({
      ...m,
      semRotulo: true,
      papelOculto: true,
    }));
    const certos = v.posicoes
      .slice()
      .sort((a, b) => b.corda - a.corda)
      .map((p, idx) => (p.funcao === funcao ? idx : -1))
      .filter((idx) => idx >= 0);
    perguntas.push({
      tipo: 'marcar-grau',
      texto: `Onde está a ${NOME_FUNCAO[funcao]} de ${cifra(acorde(ctx.tom, q))}?`,
      marcadores,
      certos,
      faixa: janelaDoVoicing(v),
    });
  }
  return {
    chave: chaveItem(modelo.id, ctx.tom, '-'),
    modeloId: modelo.id,
    formato: 'quiz-braco',
    titulo: modelo.titulo,
    tom: ctx.tom,
    forma: '-',
    instrucao: perguntas[0]?.tipo === 'marcar-grau' ? perguntas[0].texto : '',
    marcadores: [],
    quiz: perguntas,
    bpm: BPM_PADRAO,
  };
}
