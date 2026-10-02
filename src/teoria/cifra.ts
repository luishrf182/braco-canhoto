import type { AcordeInfo } from './acordes';
import { formatarNota } from './notas';

/**
 * Cifra no padrão brasileiro: C7M, Dm7, G7, Bm7(b5), B°, E♭7M, C/E.
 * Acidentes da nota com símbolo (♭/♯); o (b5) segue a grafia usual entre parênteses.
 */
export function cifra(a: AcordeInfo): string {
  const raiz = formatarNota(a.fundamental);
  const base = raiz + a.qualidade;
  return a.baixo ? `${base}/${formatarNota(a.baixo)}` : base;
}
