import type { Marcador } from '../teoria/marcador';
import type { ClasseNota, Corda } from '../teoria/notas';

export type Formato = 'ver-tocar' | 'quiz-braco' | 'identificacao' | 'progressao' | 'ouca-repita';
export type Levada = 'nenhuma' | 'balada' | 'pop' | 'groove' | 'rock';
export type FormaCaged = 'C' | 'A' | 'G' | 'E' | 'D';

export interface ConfigBpm {
  inicial: number;
  passo: 4;
  recuo: 8;
  minimo: number;
}

/** Conteúdo versionado: um modelo gera exercícios concretos por tom/forma. */
export interface ModeloExercicio {
  id: string;
  titulo: string;
  formato: Formato;
  gerador: string;
  params: Record<string, unknown>;
  bpm?: ConfigBpm;
  levada?: Levada;
  /** Usa tom (sorteio de tom depois do primeiro Limpo). */
  usaTom?: boolean;
  /** Formas CAGED em que o modelo existe (vazio = não usa forma). */
  formas?: FormaCaged[];
  /** Minutos estimados (para montar a Sessão do dia). */
  minutos?: number;
}

export interface EventoSequencia {
  midi: number | number[];
  duracao?: number;
  /** Índice do marcador a destacar. */
  indice?: number;
}

export type PerguntaQuiz =
  | {
      tipo: 'nome-do-ponto';
      corda: Corda;
      casa: number;
      /** Croma da resposta certa. */
      resposta: number;
    }
  | {
      tipo: 'tocar-nota';
      nota: ClasseNota;
      /** Restringe a uma corda (opcional). */
      corda?: Corda;
      faixa: [number, number];
    };

export interface CartaIdentificacao {
  pergunta: string;
  opcoes: string[];
  resposta: string;
  /** Marcadores/sons opcionais para ilustrar a resposta ao revelar. */
  marcadores?: Marcador[];
  midi?: number[];
}

export interface PassoProgressao {
  cifra: string;
  grau: string;
  midi: number[];
  marcadores: Marcador[];
  /** Tempos por acorde. */
  tempos: number;
}

export interface ExercicioConcreto {
  /** `${modeloId}|${tom}|${forma}` */
  chave: string;
  modeloId: string;
  formato: Formato;
  titulo: string;
  tom: ClasseNota | '-';
  forma: FormaCaged | '-';
  /** Uma linha. */
  instrucao: string;
  marcadores: Marcador[];
  faixa?: [number, number];
  sombra?: [number, number];
  eventos?: EventoSequencia[];
  /** Repetir a sequência em loop. */
  loop?: boolean;
  /** Metrônomo ligado durante o exercício. */
  clique?: boolean;
  quiz?: PerguntaQuiz[];
  cartas?: CartaIdentificacao[];
  progressao?: PassoProgressao[];
  bpm: ConfigBpm;
  levada?: Levada;
  /** Variação rítmica (aquecimentos). */
  ritmo?: string;
}

export interface ContextoGeracao {
  tom: ClasseNota;
  forma?: FormaCaged;
  rnd: () => number;
}

export const BPM_PADRAO: ConfigBpm = { inicial: 60, passo: 4, recuo: 8, minimo: 40 };

export function chaveItem(modeloId: string, tom: string, forma: string): string {
  return `${modeloId}|${tom}|${forma}`;
}
