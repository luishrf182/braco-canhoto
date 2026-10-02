// Tipos de domínio compartilhados (puros). Ver BLUEPRINT §7.4.

export type ModuloId = 'tetrades' | 'campo-maior' | 'arpejos';
export type Avaliacao = 'limpo' | 'quase' | 'travou';
export type Caixa = 1 | 2 | 3;

export interface ItemProgresso {
  caixa: Caixa;
  ultimaAvaliacao: Avaliacao;
  melhorBpm?: number;
  /** BPM de trabalho para a próxima vez (já ajustado: +4 Limpo, −8 Travou). */
  bpm?: number;
  /** Data ISO (AAAA-MM-DD) da próxima revisão. */
  proximaRevisao: string;
  atualizadoEm: string;
  vezes?: number;
  limpos?: number;
}

export interface Ajustes {
  espelhoHorizontal: boolean;
  espelhoVertical: boolean;
  calibrado: boolean;
  tema: 'claro' | 'escuro' | 'sistema';
  nomesNotas: 'letras' | 'do-re-mi';
  rotulo: 'nota' | 'grau' | 'intervalo' | 'dedo';
  sessaoMinutos: 10 | 20 | 30;
  /** Modo TV: quizzes de toque viram "pense e revele". */
  penseERevele: boolean;
  avisoIosVisto: boolean;
  diagnosticoVisto: boolean;
  atualizadoEm: string;
}

export interface EstadoModulo {
  status: 'bloqueado' | 'ativo' | 'concluido';
  atualizadoEm: string;
}

export interface ResumoSessao {
  id: string;
  data: string;
  minutos: number;
  itens: { chave: string; avaliacao: Avaliacao; bpm?: number }[];
}

export interface Progresso {
  schemaVersion: 1;
  atualizadoEm: string;
  ajustes: Ajustes;
  modulos: Record<ModuloId, EstadoModulo>;
  /** Chave: `${modeloId}|${tom}|${forma}` */
  itens: Record<string, ItemProgresso>;
  /** Últimas 60. */
  sessoes: ResumoSessao[];
}

export const EPOCA = '1970-01-01T00:00:00.000Z';

export function ajustesPadrao(): Ajustes {
  return {
    // Canhoto: pestana à direita por padrão. A calibração confirma.
    espelhoHorizontal: true,
    espelhoVertical: false,
    calibrado: false,
    tema: 'sistema',
    nomesNotas: 'letras',
    rotulo: 'nota',
    sessaoMinutos: 20,
    penseERevele: false,
    avisoIosVisto: false,
    diagnosticoVisto: false,
    atualizadoEm: EPOCA,
  };
}

export function progressoPadrao(): Progresso {
  return {
    schemaVersion: 1,
    atualizadoEm: EPOCA,
    ajustes: ajustesPadrao(),
    modulos: {
      tetrades: { status: 'ativo', atualizadoEm: EPOCA },
      'campo-maior': { status: 'ativo', atualizadoEm: EPOCA },
      arpejos: { status: 'ativo', atualizadoEm: EPOCA },
    },
    itens: {},
    sessoes: [],
  };
}
