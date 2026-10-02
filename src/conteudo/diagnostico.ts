import type { ModeloExercicio } from '../exercicios/tipos';

/**
 * Diagnóstico de entrada (BLUEPRINT §3): tríades nas formas E/A, pentatônica nas 5 formas
 * e notas no braço. Lacunas (Quase/Travou) viram itens de revisão na caixa 1.
 */
export const DIAGNOSTICO: ModeloExercicio[] = [
  {
    id: 'diag-triade-maior',
    titulo: 'Tríade maior',
    formato: 'ver-tocar',
    gerador: 'verTetrade',
    params: { qualidade: '' },
    bpm: { inicial: 60, passo: 4, recuo: 8, minimo: 40 },
    usaTom: true,
    formas: ['E', 'A'],
    minutos: 1,
  },
  {
    id: 'diag-triade-menor',
    titulo: 'Tríade menor',
    formato: 'ver-tocar',
    gerador: 'verTetrade',
    params: { qualidade: 'm' },
    bpm: { inicial: 60, passo: 4, recuo: 8, minimo: 40 },
    usaTom: true,
    formas: ['E', 'A'],
    minutos: 1,
  },
  {
    id: 'diag-penta',
    titulo: 'Pentatônica menor',
    formato: 'ver-tocar',
    gerador: 'aquecimento',
    params: { tipo: 'horizontal', escala: 'penta-menor', ritmo: 'colcheias' },
    bpm: { inicial: 70, passo: 4, recuo: 8, minimo: 40 },
    usaTom: true,
    formas: ['E', 'D', 'C', 'A', 'G'],
    minutos: 1,
  },
  {
    id: 'diag-notas',
    titulo: 'Notas no braço',
    formato: 'quiz-braco',
    gerador: 'quizNomePonto',
    params: { rodadas: 10, faixa: [0, 12] },
    minutos: 2,
  },
];

/** Itens da sessão de diagnóstico (~10 min), sempre em Lá (tom comum para a pentatônica). */
export function itensDiagnostico() {
  const itens: { modeloId: string; tom: string; forma: string }[] = [];
  for (const id of ['diag-triade-maior', 'diag-triade-menor'])
    for (const forma of ['E', 'A']) itens.push({ modeloId: id, tom: 'A', forma });
  for (const forma of ['E', 'D', 'C', 'A', 'G'])
    itens.push({ modeloId: 'diag-penta', tom: 'A', forma });
  itens.push({ modeloId: 'diag-notas', tom: '-', forma: '-' });
  return itens;
}
