import { ajustesPadrao, progressoPadrao, type Progresso } from '../tipos';

const CHAVE = 'braco-canhoto:progresso';

function lerBruto(chave: string): string | null {
  try {
    return localStorage.getItem(chave);
  } catch {
    return null;
  }
}

function gravarBruto(chave: string, valor: string): void {
  try {
    localStorage.setItem(chave, valor);
  } catch {
    // Modo privado ou cota cheia: segue só em memória.
  }
}

/** Completa campos que faltam (versões antigas do app) sem perder o que existe. */
export function normalizar(dado: unknown): Progresso {
  const base = progressoPadrao();
  if (!dado || typeof dado !== 'object') return base;
  const p = dado as Partial<Progresso>;
  if (p.schemaVersion !== 1) return base;
  return {
    ...base,
    ...p,
    ajustes: { ...ajustesPadrao(), ...(p.ajustes ?? {}) },
    modulos: { ...base.modulos, ...(p.modulos ?? {}) },
    itens: { ...(p.itens ?? {}) },
    sessoes: Array.isArray(p.sessoes) ? p.sessoes.slice(-60) : [],
    licoesVistas: { ...(p.licoesVistas ?? {}) },
  };
}

export function carregarLocal(): Progresso {
  const bruto = lerBruto(CHAVE);
  if (!bruto) return progressoPadrao();
  try {
    return normalizar(JSON.parse(bruto));
  } catch {
    return progressoPadrao();
  }
}

export function salvarLocal(p: Progresso): void {
  gravarBruto(CHAVE, JSON.stringify(p));
}

/** "Apagar dados deste aparelho". */
export function apagarTudoLocal(): void {
  try {
    for (const k of Object.keys(localStorage)) {
      if (k.startsWith('braco-canhoto:')) localStorage.removeItem(k);
    }
  } catch {
    // ignora
  }
}

/** Armazenamento genérico de chave/valor para outros módulos de src/progresso. */
export const armazenamento = { ler: lerBruto, gravar: gravarBruto };
