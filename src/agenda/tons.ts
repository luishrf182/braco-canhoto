import { escolherPonderado, type Aleatorio } from '../exercicios/aleatorio';
import { TONS, type ClasseNota } from '../teoria/notas';

/** Tons mais comuns na guitarra ganham peso maior no sorteio (BLUEPRINT §7.4). */
export const TONS_FAVORITOS: ClasseNota[] = ['C', 'G', 'D', 'A', 'E', 'F', 'Bb'];
export const PESO_FAVORITO = 3;

export function sortearTom(rnd: Aleatorio, excluir: ClasseNota[] = []): ClasseNota {
  const candidatos = TONS.filter((t) => !excluir.includes(t));
  return escolherPonderado(
    candidatos.map((t) => ({ valor: t, peso: TONS_FAVORITOS.includes(t) ? PESO_FAVORITO : 1 })),
    rnd,
  );
}
