import type { ModeloExercicio } from '../../exercicios/tipos';
import type { Modulo } from '../tipos';

const BPM = { inicial: 60, passo: 4, recuo: 8, minimo: 40 } as const;
const FORMAS: ModeloExercicio['formas'] = ['C', 'A', 'G', 'E', 'D'];

const arpejoDe = (id: string, titulo: string, qualidade: string): ModeloExercicio => ({
  id,
  titulo,
  formato: 'ver-tocar',
  gerador: 'verArpejo',
  params: { qualidade },
  bpm: BPM,
  usaTom: true,
  formas: FORMAS,
  minutos: 2,
});

/** Módulo 3 — Arpejos no CAGED (BLUEPRINT §3). Textos originais; dados do motor. */
export const ARPEJOS: Modulo = {
  id: 'arpejos',
  titulo: 'Arpejos no CAGED',
  descricao: 'As tétrades nota por nota, nas 5 formas, e a ligação entre elas.',
  licoes: [
    {
      id: 'arpejo',
      titulo: 'Acorde nota por nota',
      telas: [
        {
          texto:
            'Arpejo é o acorde tocado nota por nota, dentro da mesma forma do braço. Você usa as notas do acorde em todas as cordas, não só as do desenho de acorde.',
          exemplo: { tipo: 'arpejo', tom: 'C', qualidade: '7M', forma: 'A' },
        },
        {
          texto:
            'A mesma ideia vale para qualquer forma: suba da nota mais grave à mais aguda e volte. A tônica, em quadrado, é a sua referência.',
          exemplo: { tipo: 'arpejo', tom: 'C', qualidade: 'm7', forma: 'E' },
        },
      ],
    },
    {
      id: 'conexao',
      titulo: 'Ligar as formas',
      telas: [
        {
          texto:
            'As cinco formas se encaixam ao longo do braço: as casas mais altas de uma forma são as mais baixas da seguinte, com notas em comum. Assim você sobe e desce sem perder a tônica.',
          exemplo: {
            tipo: 'conexao',
            tom: 'C',
            qualidade: '7M',
            formas: ['C', 'A', 'G', 'E', 'D'],
          },
        },
      ],
    },
  ],
  modelos: [
    arpejoDe('arpejo-7M', 'Arpejo 7M', '7M'),
    arpejoDe('arpejo-7', 'Arpejo 7', '7'),
    arpejoDe('arpejo-m7', 'Arpejo m7', 'm7'),
    arpejoDe('arpejo-m7b5', 'Arpejo m7(b5)', 'm7(b5)'),
    arpejoDe('arpejo-dim', 'Arpejo diminuto (°)', '°'),
    {
      id: 'arpejo-conectar',
      titulo: 'Ligar as 5 formas',
      formato: 'ver-tocar',
      gerador: 'conectarFormas',
      params: { qualidade: '7M' },
      bpm: BPM,
      usaTom: true,
      minutos: 3,
    },
    {
      id: 'arpejo-campo',
      titulo: 'Campo em arpejos numa região',
      formato: 'ver-tocar',
      gerador: 'arpejosDoCampo',
      params: { centro: 5 },
      bpm: BPM,
      usaTom: true,
      minutos: 3,
    },
    {
      id: 'arpejo-onde-3',
      titulo: 'Toque a 3ª do arpejo',
      formato: 'quiz-braco',
      gerador: 'grauNoArpejo',
      params: { rodadas: 6, papel: '3' },
      usaTom: true,
      minutos: 2,
    },
  ],
  checkpoint: {
    requisitos: [
      {
        modelos: ['arpejo-7M', 'arpejo-m7', 'arpejo-7'],
        formas: ['C', 'A', 'G', 'E', 'D'],
        minimoLimpos: 3,
      },
    ],
    descricao: 'Arpejos de 7M, m7 e 7 nas 5 formas, com Limpo em 3 tons.',
  },
};
