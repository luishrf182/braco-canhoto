import type { ModeloExercicio } from '../../exercicios/tipos';
import type { Modulo } from '../tipos';

const BPM_BASE = { inicial: 70, passo: 4, recuo: 8, minimo: 50 } as const;

/** As 8 cadências por grau (BLUEPRINT §3, Módulo 2). */
export const CADENCIAS: { id: string; graus: string[]; levada: ModeloExercicio['levada'] }[] = [
  { id: 'cadencia-1', graus: ['I', 'V', 'VIm', 'IV'], levada: 'pop' },
  { id: 'cadencia-2', graus: ['IV', 'V', 'VIm', 'I'], levada: 'balada' },
  { id: 'cadencia-3', graus: ['IIm', 'IV', 'I', 'V'], levada: 'groove' },
  { id: 'cadencia-4', graus: ['I', 'V/3', 'VIm', 'IIIm', 'IV', 'IIm', 'V'], levada: 'balada' },
  { id: 'cadencia-5', graus: ['VIm', 'IV', 'I', 'V'], levada: 'rock' },
  { id: 'cadencia-6', graus: ['VIm', 'V', 'IV', 'V7/VI'], levada: 'rock' },
  { id: 'cadencia-7', graus: ['VIm', 'V', 'IIm', 'IV'], levada: 'groove' },
  { id: 'cadencia-8', graus: ['VIm', 'I', 'IIm', 'IV'], levada: 'pop' },
];

/** Módulo 2 — Campo harmônico maior em tétrades. Textos originais; dados do motor. */
export const CAMPO_MAIOR: Modulo = {
  id: 'campo-maior',
  titulo: 'Campo harmônico maior',
  descricao: 'Os 7 acordes de um tom, suas funções e 8 cadências com base.',
  licoes: [
    {
      id: 'empilhamento',
      titulo: 'Empilhar terças na escala',
      telas: [
        {
          texto:
            'Pegue a escala maior e, a partir de cada nota, empilhe terças pulando uma nota da escala. Saem sete tétrades, uma por grau.',
          exemplo: { tipo: 'campo', tom: 'C' },
        },
        {
          texto:
            'A sequência de qualidades é sempre a mesma: I7M, IIm7, IIIm7, IV7M, V7, VIm7 e VIIm7(b5). Muda só o tom.',
          exemplo: { tipo: 'campo', tom: 'C' },
        },
      ],
    },
    {
      id: 'funcoes',
      titulo: 'Funções e relativa menor',
      telas: [
        {
          texto:
            'I, IIIm e VIm têm função de tônica: repouso. IIm e IV preparam (subdominante); V7 e VIIm7(b5) pedem resolução (dominante).',
          exemplo: { tipo: 'cadencia', tom: 'C', graus: ['I', 'IV', 'V', 'I'] },
        },
        {
          texto:
            'O VIm é a relativa menor: usa as mesmas notas do tom maior. Am é a relativa de C.',
          exemplo: { tipo: 'cadencia', tom: 'C', graus: ['VIm', 'IV', 'I', 'V'] },
        },
      ],
    },
  ],
  modelos: [
    {
      id: 'campo-qual-grau',
      titulo: 'Graus relâmpago',
      formato: 'identificacao',
      gerador: 'identificarGrauCampo',
      params: { rodadas: 8 },
      minutos: 2,
    },
    {
      id: 'campo-relativas',
      titulo: 'Cartas de relativas',
      formato: 'identificacao',
      gerador: 'relativas',
      params: { rodadas: 8 },
      minutos: 2,
    },
    {
      id: 'campo-tocar',
      titulo: 'Campo inteiro em tétrades',
      formato: 'progressao',
      gerador: 'tocarCampo',
      params: { centro: 5 },
      bpm: BPM_BASE,
      levada: 'nenhuma',
      usaTom: true,
      minutos: 3,
    },
    ...CADENCIAS.map((c, i): ModeloExercicio => ({
      id: c.id,
      titulo: `Cadência ${i + 1}: ${c.graus.join(' – ')}`,
      formato: 'progressao',
      gerador: 'progressaoCadencia',
      params: { graus: c.graus, centro: 5 },
      bpm: BPM_BASE,
      levada: c.levada,
      usaTom: true,
      minutos: 3,
    })),
  ],
  checkpoint: {
    requisitos: [
      { modelos: ['campo-tocar'], minimoLimpos: 4 },
      { modelos: CADENCIAS.map((c) => c.id), minimoLimpos: 1, minimoModelos: 4 },
    ],
    descricao: 'Campo em tétrades em 4 tons e 4 cadências com Limpo.',
  },
};
