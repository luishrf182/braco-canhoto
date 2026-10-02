/** Gerador pseudoaleatório com semente (mulberry32), para testes reprodutíveis. */
export type Aleatorio = () => number;

export function criarAleatorio(semente: number): Aleatorio {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function escolher<T>(lista: readonly T[], rnd: Aleatorio): T {
  if (!lista.length) throw new Error('lista vazia');
  return lista[Math.floor(rnd() * lista.length)]!;
}

export function embaralhar<T>(lista: readonly T[], rnd: Aleatorio): T[] {
  const r = [...lista];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [r[i], r[j]] = [r[j]!, r[i]!];
  }
  return r;
}

/** Escolha ponderada: pesos não precisam somar 1. */
export function escolherPonderado<T>(
  itens: readonly { valor: T; peso: number }[],
  rnd: Aleatorio,
): T {
  const total = itens.reduce((s, i) => s + i.peso, 0);
  let x = rnd() * total;
  for (const i of itens) {
    x -= i.peso;
    if (x <= 0) return i.valor;
  }
  return itens[itens.length - 1]!.valor;
}
