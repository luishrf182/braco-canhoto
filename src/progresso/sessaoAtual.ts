import type { ItemSessao } from '../agenda/sessao';
import type { Avaliacao, Caixa } from '../tipos';
import { armazenamento } from './local';

const CHAVE = 'braco-canhoto:sessao';

export interface ResultadoItem {
  chave: string;
  titulo: string;
  avaliacao: Avaliacao;
  bpm?: number;
  bpmAntes?: number;
  caixaAntes?: Caixa;
  caixaDepois: Caixa;
  proximaRevisao: string;
}

export interface SessaoAtual {
  id: string;
  data: string;
  minutos: number;
  itens: ItemSessao[];
  indice: number;
  resultados: ResultadoItem[];
  concluida: boolean;
}

export function lerSessao(): SessaoAtual | null {
  try {
    const bruto = armazenamento.ler(CHAVE);
    return bruto ? (JSON.parse(bruto) as SessaoAtual) : null;
  } catch {
    return null;
  }
}

export function gravarSessao(s: SessaoAtual | null): void {
  armazenamento.gravar(CHAVE, s ? JSON.stringify(s) : '');
}
