import { armazenamento } from './local';

const CHAVE = 'braco-canhoto:erros';
const MAXIMO = 20;

export interface RegistroErro {
  em: string;
  mensagem: string;
}

let memoria: RegistroErro[] | null = null;

function carregar(): RegistroErro[] {
  if (memoria) return memoria;
  try {
    const bruto = armazenamento.ler(CHAVE);
    memoria = bruto ? (JSON.parse(bruto) as RegistroErro[]) : [];
  } catch {
    memoria = [];
  }
  return memoria;
}

export function registrarErro(erro: unknown): void {
  const mensagem =
    erro instanceof Error ? `${erro.name}: ${erro.message}` : String(erro ?? 'erro desconhecido');
  const lista = [...carregar(), { em: new Date().toISOString(), mensagem: mensagem.slice(0, 300) }];
  memoria = lista.slice(-MAXIMO);
  armazenamento.gravar(CHAVE, JSON.stringify(memoria));
}

export function lerErros(): RegistroErro[] {
  return [...carregar()].reverse();
}

export function limparErros(): void {
  memoria = [];
  armazenamento.gravar(CHAVE, '[]');
}
