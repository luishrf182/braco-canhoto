// Lê o JSON que o Claude Code envia aos hooks pela entrada padrão.
export async function lerEntrada() {
  let bruto = '';
  for await (const parte of process.stdin) bruto += parte;
  try {
    return JSON.parse(bruto);
  } catch {
    return {};
  }
}

export function caminhoRelativo(caminho) {
  if (!caminho) return '';
  const raiz = process.cwd().replace(/\\/g, '/').toLowerCase();
  const p = caminho.replace(/\\/g, '/');
  return p.toLowerCase().startsWith(raiz + '/') ? p.slice(raiz.length + 1) : p;
}
