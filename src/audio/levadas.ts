// Levadas de bateria em grade de semicolcheias (16 passos por compasso 4/4).
// Puro: só dados. "x" = toque forte, "o" = toque fraco, "." = pausa.

export type NomeLevada = 'balada' | 'pop' | 'groove' | 'rock';

export interface Levada {
  nome: NomeLevada;
  rotulo: string;
  bumbo: string;
  caixa: string;
  chimbal: string;
  /** Padrão do baixo: posições (semicolcheias) onde toca a nota do baixo. */
  baixo: string;
}

export const LEVADAS: Record<NomeLevada, Levada> = {
  balada: {
    nome: 'balada',
    rotulo: 'Balada',
    bumbo: 'x.......x.......',
    caixa: '....x.......x...',
    chimbal: 'x.o.x.o.x.o.x.o.',
    baixo: 'x.......x.......',
  },
  pop: {
    nome: 'pop',
    rotulo: 'Pop',
    bumbo: 'x.....x.x.......',
    caixa: '....x.......x...',
    chimbal: 'x.x.x.x.x.x.x.x.',
    baixo: 'x.....x.x.....x.',
  },
  groove: {
    nome: 'groove',
    rotulo: 'Groove',
    bumbo: 'x..x....x.x.....',
    caixa: '....x..o....x..o',
    chimbal: 'xoxoxoxoxoxoxoxo',
    baixo: 'x..x....x.x...x.',
  },
  rock: {
    nome: 'rock',
    rotulo: 'Rock',
    bumbo: 'x.......x.x.....',
    caixa: '....x.......x...',
    chimbal: 'x.x.x.x.x.x.x.x.',
    baixo: 'x.x.x.x.x.x.x.x.',
  },
};

export const NOMES_LEVADA: NomeLevada[] = ['balada', 'pop', 'groove', 'rock'];

export interface Toque {
  passo: number;
  forca: number;
}

/** Converte uma linha da grade em toques (forte = 1, fraco = 0,45). */
export function toques(linha: string): Toque[] {
  const res: Toque[] = [];
  for (let i = 0; i < linha.length; i++) {
    const c = linha[i];
    if (c === 'x') res.push({ passo: i, forca: 1 });
    else if (c === 'o') res.push({ passo: i, forca: 0.45 });
  }
  return res;
}
