import type { Progresso, ResumoSessao } from '../tipos';

/** O mais recente por `atualizadoEm`; empate fica com `a`. */
function maisRecente<T extends { atualizadoEm: string }>(
  a: T | undefined,
  b: T | undefined,
): T | undefined {
  if (!a) return b;
  if (!b) return a;
  return b.atualizadoEm > a.atualizadoEm ? b : a;
}

function juntarRegistros<T extends { atualizadoEm: string }>(
  a: Record<string, T>,
  b: Record<string, T>,
): Record<string, T> {
  const res: Record<string, T> = {};
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const v = maisRecente(a[k], b[k]);
    if (v) res[k] = v;
  }
  return res;
}

function juntarSessoes(a: ResumoSessao[], b: ResumoSessao[]): ResumoSessao[] {
  const porId = new Map<string, ResumoSessao>();
  for (const s of [...a, ...b]) {
    const atual = porId.get(s.id);
    // A versão com mais itens avaliados é a mais completa.
    if (!atual || s.itens.length > atual.itens.length) porId.set(s.id, s);
  }
  return [...porId.values()]
    .sort((x, y) => x.data.localeCompare(y.data) || x.id.localeCompare(y.id))
    .slice(-60);
}

/**
 * Junta dois progressos sem perder nada (ADR-6): item a item pelo `atualizadoEm` mais recente.
 * Ajustes e status dos módulos idem; sessões e lições vistas são uniões.
 * Função pura e comutativa nos dados (a ordem dos argumentos só desempata iguais).
 */
export function juntar(a: Progresso, b: Progresso): Progresso {
  const licoes: Record<string, string> = { ...(b.licoesVistas ?? {}) };
  for (const [k, v] of Object.entries(a.licoesVistas ?? {})) {
    const outro = licoes[k];
    licoes[k] = outro && outro < v ? outro : v; // guarda a primeira vez que foi vista
  }
  return {
    schemaVersion: 1,
    atualizadoEm: a.atualizadoEm > b.atualizadoEm ? a.atualizadoEm : b.atualizadoEm,
    ajustes: maisRecente(a.ajustes, b.ajustes)!,
    modulos: juntarRegistros(a.modulos, b.modulos) as Progresso['modulos'],
    itens: juntarRegistros(a.itens, b.itens),
    sessoes: juntarSessoes(a.sessoes, b.sessoes),
    licoesVistas: licoes,
  };
}

/** Os dois progressos têm o mesmo conteúdo (ignora `atualizadoEm` global)? */
export function mesmoConteudo(a: Progresso, b: Progresso): boolean {
  const semCarimbo = (p: Progresso) => JSON.stringify({ ...p, atualizadoEm: '' });
  return semCarimbo(a) === semCarimbo(b);
}
