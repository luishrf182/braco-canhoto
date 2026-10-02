import { escolher } from './aleatorio';
import {
  BPM_PADRAO,
  chaveItem,
  type ContextoGeracao,
  type EventoSequencia,
  type ExercicioConcreto,
  type ModeloExercicio,
  type PerguntaQuiz,
} from './tipos';
import { acorde, QUALIDADES_TETRADE, type Qualidade } from '../teoria/acordes';
import { arpejo, arpejoNaRegiao, formasEmOrdem } from '../teoria/arpejos';
import { campoHarmonico } from '../teoria/campo';
import { cifra } from '../teoria/cifra';
import type { Marcador } from '../teoria/marcador';

const BPM_ARPEJO = { ...BPM_PADRAO, inicial: 60 };

/** Sobe e desce (sem repetir a nota do topo). */
function sobeDesce(n: number): number[] {
  const sobe = Array.from({ length: n }, (_, i) => i);
  return [...sobe, ...sobe.slice(0, -1).reverse()];
}

/** Ver e tocar um arpejo numa forma: sobe e desce em colcheias. */
export function verArpejo(modelo: ModeloExercicio, ctx: ContextoGeracao): ExercicioConcreto {
  const q =
    (modelo.params.qualidade as Qualidade | undefined) ?? escolher(QUALIDADES_TETRADE, ctx.rnd);
  const forma = ctx.forma ?? 'E';
  const a = arpejo(ctx.tom, q, forma);
  return {
    chave: chaveItem(modelo.id, ctx.tom, forma),
    modeloId: modelo.id,
    formato: 'ver-tocar',
    titulo: modelo.titulo,
    tom: ctx.tom,
    forma,
    instrucao: `Arpejo de ${cifra(acorde(ctx.tom, q))} · forma de ${forma}: suba e desça`,
    marcadores: a.marcadores,
    faixa: a.janela[0] === 0 ? [0, 5] : [a.janela[0] - 1, a.janela[1] + 1],
    sombra: a.janela,
    eventos: sobeDesce(a.marcadores.length).map((i) => ({
      midi: a.marcadores[i]!.midi!,
      indice: i,
      duracao: 1 / 2,
    })),
    loop: true,
    clique: true,
    bpm: modelo.bpm ?? BPM_ARPEJO,
  };
}

/** Junta marcadores de várias formas sem repetir casa. */
function uniao(listas: Marcador[][]): { marcadores: Marcador[]; indice: (m: Marcador) => number } {
  const marcadores: Marcador[] = [];
  const pos = new Map<string, number>();
  for (const l of listas)
    for (const m of l) {
      const k = `${m.corda}:${m.casa}`;
      if (!pos.has(k)) {
        pos.set(k, marcadores.length);
        marcadores.push(m);
      }
    }
  return { marcadores, indice: (m) => pos.get(`${m.corda}:${m.casa}`)! };
}

/** Conectar as 5 formas: sobe numa, desce na seguinte, subindo pelo braço sem perder a tônica. */
export function conectarFormas(modelo: ModeloExercicio, ctx: ContextoGeracao): ExercicioConcreto {
  const q = (modelo.params.qualidade as Qualidade | undefined) ?? '7M';
  const formas = formasEmOrdem(ctx.tom, q);
  const { marcadores, indice } = uniao(formas.map((f) => f.marcadores));
  const eventos: EventoSequencia[] = formas.flatMap((f, k) => {
    const ordem = k % 2 === 0 ? f.marcadores : [...f.marcadores].reverse();
    return ordem.map((m) => ({ midi: m.midi!, indice: indice(m), duracao: 1 / 2 }));
  });
  return {
    chave: chaveItem(modelo.id, ctx.tom, '-'),
    modeloId: modelo.id,
    formato: 'ver-tocar',
    titulo: modelo.titulo,
    tom: ctx.tom,
    forma: '-',
    instrucao: `${cifra(acorde(ctx.tom, q))} nas 5 formas: ${formas.map((f) => f.forma).join(' → ')}`,
    marcadores,
    eventos,
    clique: true,
    bpm: modelo.bpm ?? BPM_ARPEJO,
  };
}

/** Arpejos do campo harmônico em sequência (I7M → IIm7 → …) numa única região. */
export function arpejosDoCampo(modelo: ModeloExercicio, ctx: ContextoGeracao): ExercicioConcreto {
  const centro = (modelo.params.centro as number | undefined) ?? 5;
  const campo = campoHarmonico(ctx.tom, 'tetrade');
  const arps = campo.map((g) => arpejoNaRegiao(g.acorde.fundamental, g.acorde.qualidade, centro));
  // Na união, cada casa vira "nota da região"; o destaque mostra o arpejo que soa.
  const { marcadores, indice } = uniao(
    arps.map((a) => a.marcadores.map((m) => ({ ...m, papel: 'escala' as const, grau: undefined }))),
  );
  for (const m of arps[0]!.marcadores) {
    const i = indice(m);
    if (m.papel === 'fundamental') marcadores[i] = { ...marcadores[i]!, papel: 'fundamental' };
  }
  // Até 8 notas do arpejo, subindo a partir da nota mais grave da região.
  const eventos: EventoSequencia[] = arps.flatMap((a) =>
    a.marcadores.slice(0, 8).map((m) => ({ midi: m.midi!, indice: indice(m), duracao: 1 / 2 })),
  );
  return {
    chave: chaveItem(modelo.id, ctx.tom, '-'),
    modeloId: modelo.id,
    formato: 'ver-tocar',
    titulo: modelo.titulo,
    tom: ctx.tom,
    forma: '-',
    instrucao: `Campo de {n:${ctx.tom}} em arpejos: ${campo.map((g) => cifra(g.acorde)).join(' → ')}`,
    marcadores,
    eventos,
    clique: true,
    bpm: modelo.bpm ?? BPM_ARPEJO,
  };
}

/** Quiz: "toque a 3ª deste arpejo" (ou outra função). */
export function grauNoArpejo(modelo: ModeloExercicio, ctx: ContextoGeracao): ExercicioConcreto {
  const rodadas = (modelo.params.rodadas as number | undefined) ?? 6;
  const papel = (modelo.params.papel as '3' | '5' | '7' | undefined) ?? '3';
  const nome = { '3': '3ª', '5': '5ª', '7': '7ª' }[papel];
  const perguntas: PerguntaQuiz[] = [];
  for (let i = 0; i < rodadas; i++) {
    const q = escolher(QUALIDADES_TETRADE, ctx.rnd);
    const forma = escolher(['C', 'A', 'G', 'E', 'D'] as const, ctx.rnd);
    const a = arpejo(ctx.tom, q, forma);
    perguntas.push({
      tipo: 'marcar-grau',
      texto: `Toque uma ${nome} do arpejo de ${cifra(acorde(ctx.tom, q))} (forma de ${forma})`,
      marcadores: a.marcadores,
      certos: a.marcadores.map((m, k) => (m.papel === papel ? k : -1)).filter((k) => k >= 0),
      faixa: a.janela[0] === 0 ? [0, 5] : [a.janela[0] - 1, a.janela[1] + 1],
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
