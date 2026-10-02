import { criarAleatorio } from './aleatorio';
import { aquecimento } from './aquecimentos';
import { arpejosDoCampo, conectarFormas, grauNoArpejo, verArpejo } from './arpejos';
import { oitavas, quizNomePonto, quizTocarNota, todasAsNotas } from './mapa';
import { identificarTetrade, ondeEstaGrau, verTetrade } from './tetrades';
import {
  identificarGrauCampo,
  progressaoCadencia,
  progressaoRegioes,
  relativas,
  tocarCampo,
} from './campo';
import type { ContextoGeracao, ExercicioConcreto, FormaCaged, ModeloExercicio } from './tipos';
import type { ClasseNota } from '../teoria/notas';

export type Gerador = (modelo: ModeloExercicio, ctx: ContextoGeracao) => ExercicioConcreto;

const GERADORES: Record<string, Gerador> = {
  quizNomePonto,
  quizTocarNota,
  todasAsNotas,
  oitavas,
  verTetrade,
  identificarTetrade,
  ondeEstaGrau,
  progressaoCadencia,
  progressaoRegioes,
  tocarCampo,
  identificarGrauCampo,
  relativas,
  aquecimento,
  verArpejo,
  conectarFormas,
  arpejosDoCampo,
  grauNoArpejo,
};

/** Outros módulos de exercícios registram seus geradores aqui. */
export function registrarGeradores(g: Record<string, Gerador>): void {
  Object.assign(GERADORES, g);
}

export function temGerador(nome: string): boolean {
  return nome in GERADORES;
}

export function gerarExercicio(
  modelo: ModeloExercicio,
  o: { tom?: ClasseNota; forma?: FormaCaged; semente?: number } = {},
): ExercicioConcreto {
  const g = GERADORES[modelo.gerador];
  if (!g) throw new Error(`Gerador desconhecido: ${modelo.gerador}`);
  const forma = o.forma ?? modelo.formas?.[0];
  const ctx: ContextoGeracao = {
    tom: o.tom ?? 'C',
    rnd: criarAleatorio(o.semente ?? Date.now()),
    ...(forma ? { forma } : {}),
  };
  return g(modelo, ctx);
}
