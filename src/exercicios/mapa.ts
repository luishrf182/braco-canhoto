import { escolher } from './aleatorio';
import type { ContextoGeracao, ExercicioConcreto, ModeloExercicio, PerguntaQuiz } from './tipos';
import { BPM_PADRAO, chaveItem } from './tipos';
import { padroesOitava } from '../teoria/oitavas';
import { CORDAS, croma, notaNa, posicoesDe, TONS, type Corda } from '../teoria/notas';
import type { Marcador } from '../teoria/marcador';

function base(
  modelo: ModeloExercicio,
  tom: string,
): Omit<ExercicioConcreto, 'instrucao' | 'marcadores'> {
  return {
    chave: chaveItem(modelo.id, tom, '-'),
    modeloId: modelo.id,
    formato: modelo.formato,
    titulo: modelo.titulo,
    tom: tom as ExercicioConcreto['tom'],
    forma: '-',
    bpm: modelo.bpm ?? BPM_PADRAO,
  };
}

/** Quiz: um ponto aparece sem nome e a pessoa escolhe a nota. */
export function quizNomePonto(modelo: ModeloExercicio, ctx: ContextoGeracao): ExercicioConcreto {
  const faixa = (modelo.params.faixa as [number, number]) ?? [0, 12];
  const rodadas = (modelo.params.rodadas as number) ?? 8;
  const naturais = modelo.params.naturais === true;
  const perguntas: PerguntaQuiz[] = [];
  let ultimo = '';
  while (perguntas.length < rodadas) {
    const corda = escolher(CORDAS, ctx.rnd);
    const casa = faixa[0] + Math.floor(ctx.rnd() * (faixa[1] - faixa[0] + 1));
    const n = notaNa(corda, casa);
    if (naturais && n.nome.length > 1) continue;
    const id = `${corda}:${casa}`;
    if (id === ultimo) continue;
    ultimo = id;
    perguntas.push({ tipo: 'nome-do-ponto', corda, casa, resposta: n.croma });
  }
  return {
    ...base(modelo, '-'),
    instrucao: 'Que nota é esta?',
    marcadores: [],
    faixa,
    quiz: perguntas,
  };
}

/** Quiz: o app pede uma nota e a pessoa toca o ponto na tela. */
export function quizTocarNota(modelo: ModeloExercicio, ctx: ContextoGeracao): ExercicioConcreto {
  const faixa = (modelo.params.faixa as [number, number]) ?? [0, 12];
  const rodadas = (modelo.params.rodadas as number) ?? 8;
  const porCorda = modelo.params.porCorda === true;
  const perguntas: PerguntaQuiz[] = [];
  let ultima = '';
  while (perguntas.length < rodadas) {
    const nota = escolher(TONS, ctx.rnd);
    if (nota === ultima) continue;
    ultima = nota;
    const corda: Corda | undefined = porCorda ? escolher(CORDAS, ctx.rnd) : undefined;
    perguntas.push(
      corda ? { tipo: 'tocar-nota', nota, corda, faixa } : { tipo: 'tocar-nota', nota, faixa },
    );
  }
  return {
    ...base(modelo, '-'),
    instrucao: 'Toque a nota pedida no braço',
    marcadores: [],
    faixa,
    quiz: perguntas,
  };
}

/** Ver e tocar: todas as notas X, com metrônomo. */
export function todasAsNotas(modelo: ModeloExercicio, ctx: ContextoGeracao): ExercicioConcreto {
  const faixa = (modelo.params.faixa as [number, number]) ?? [0, 15];
  const posicoes = posicoesDe(ctx.tom, faixa);
  const marcadores: Marcador[] = posicoes.map((p) => ({
    ...p,
    papel: 'fundamental',
    nota: ctx.tom,
  }));
  const ordem = marcadores.map((m, i) => ({ m, i })).sort((a, b) => a.m.midi! - b.m.midi!);
  return {
    ...base(modelo, ctx.tom),
    instrucao: `Toque todas as notas {n:${ctx.tom}} no tempo do clique`,
    marcadores,
    faixa,
    eventos: ordem.map(({ m, i }) => ({ midi: m.midi!, indice: i, duracao: 2 })),
    clique: true,
    loop: true,
  };
}

/** Ver e tocar: padrões de oitava de uma nota pelo braço. */
export function oitavas(modelo: ModeloExercicio, ctx: ContextoGeracao): ExercicioConcreto {
  const pares = padroesOitava(ctx.tom);
  const filtro = modelo.params.padrao as string | undefined;
  const usados = filtro ? pares.filter((p) => p.padrao.id === filtro) : pares;
  const marcadores: Marcador[] = [];
  const eventos: ExercicioConcreto['eventos'] = [];
  const vistos = new Map<string, number>();
  const indiceDe = (corda: Corda, casa: number, midi: number) => {
    const k = `${corda}:${casa}`;
    if (!vistos.has(k)) {
      vistos.set(k, marcadores.length);
      marcadores.push({ corda, casa, midi, papel: 'fundamental', nota: ctx.tom });
    }
    return vistos.get(k)!;
  };
  for (const { notas } of usados.sort((a, b) => a.notas[0]!.midi - b.notas[0]!.midi)) {
    const [g, a] = notas as [(typeof notas)[0], (typeof notas)[0]];
    eventos.push({ midi: g.midi, indice: indiceDe(g.corda, g.casa, g.midi) });
    eventos.push({ midi: a.midi, indice: indiceDe(a.corda, a.casa, a.midi) });
  }
  return {
    ...base(modelo, ctx.tom),
    instrucao: `Oitavas de {n:${ctx.tom}}: toque cada par, grave e aguda`,
    marcadores,
    eventos,
  };
}

/** Confere a resposta de uma pergunta "tocar-nota". */
export function acertouToque(p: PerguntaQuiz, corda: Corda, casa: number): boolean {
  if (p.tipo !== 'tocar-nota') return false;
  if (p.corda && p.corda !== corda) return false;
  if (casa < p.faixa[0] || casa > p.faixa[1]) return false;
  return notaNa(corda, casa).croma === croma(p.nota);
}
