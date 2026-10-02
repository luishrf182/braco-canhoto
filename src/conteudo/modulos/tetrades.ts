import type { Modulo } from '../tipos';

const BPM = { inicial: 60, passo: 4, recuo: 8, minimo: 40 } as const;

/** Módulo 1 — Tétrades (BLUEPRINT §3). Textos originais, curtos; dados musicais vêm do motor. */
export const TETRADES: Modulo = {
  id: 'tetrades',
  titulo: 'Tétrades',
  descricao: 'As 5 qualidades de acorde com 7ª, nas formas de E, A e D.',
  licoes: [
    {
      id: 'formula',
      titulo: 'Fórmula 1-3-5-7',
      telas: [
        {
          texto:
            'Tétrade é um acorde de quatro notas: tônica, 3ª, 5ª e 7ª. Você chega nelas empilhando terças a partir da tônica.',
          exemplo: { tipo: 'notas-acorde', tom: 'C', qualidade: '7M' },
        },
        {
          texto:
            '7M e 7 têm 3ª maior; m7 e m7(b5) têm 3ª menor. A diferença entre 7M e 7 está só na 7ª.',
          exemplo: { tipo: 'notas-acorde', tom: 'C', qualidade: '7' },
        },
        {
          texto:
            'No m7(b5) a 5ª desce meio tom. No ° (diminuto) a 7ª também desce, e as quatro notas ficam à mesma distância.',
          exemplo: { tipo: 'notas-acorde', tom: 'C', qualidade: '°' },
        },
      ],
    },
    {
      id: 'abertura-1',
      titulo: 'Abertura 1',
      telas: [
        {
          texto:
            'Na pestana da forma de A, as cordas 5 a 2 tocam tônica, 5ª, oitava e 3ª. Repare na oitava na 3ª corda.',
          exemplo: { tipo: 'voicing', tom: 'C', qualidade: '', forma: 'A' },
        },
        {
          texto:
            'Troque a oitava pela 7ª: uma casa abaixo para 7M, duas casas abaixo para 7. A 1ª e a 6ª corda ficam mudas.',
          exemplo: { tipo: 'voicing', tom: 'C', qualidade: '7M', forma: 'A', abertura: 1 },
        },
        {
          texto: 'A mesma troca funciona na forma de D, nas quatro cordas mais agudas.',
          exemplo: { tipo: 'voicing', tom: 'C', qualidade: '7M', forma: 'D', abertura: 1 },
        },
      ],
    },
    {
      id: 'abertura-2',
      titulo: 'Abertura 2',
      telas: [
        {
          texto:
            'Na forma de E, a 7ª vai para a 4ª corda e a 5ª fica no agudo: tônica, 7ª, 3ª e 5ª. A 5ª corda fica muda.',
          exemplo: { tipo: 'voicing', tom: 'C', qualidade: '7M', forma: 'E', abertura: 2 },
        },
        {
          texto: 'As notas ficam mais espalhadas e o acorde soa menos embolado nos graves.',
          exemplo: { tipo: 'voicing', tom: 'C', qualidade: 'm7', forma: 'E', abertura: 2 },
        },
      ],
    },
    {
      id: 'omissao',
      titulo: 'Omitir notas',
      telas: [
        {
          texto:
            'Sem a tônica grave, o acorde fica mais leve e deixa espaço para o baixo. A 3ª e a 7ª carregam o som do acorde.',
          exemplo: {
            tipo: 'voicing',
            tom: 'C',
            qualidade: '7M',
            forma: 'A',
            abertura: 1,
            omitir: ['1'],
          },
        },
        {
          texto:
            'Em 7M, 7 e m7, tirar a 5ª também funciona: ela é justa e quase não muda o caráter do acorde.',
          exemplo: {
            tipo: 'voicing',
            tom: 'C',
            qualidade: '7',
            forma: 'E',
            abertura: 2,
            omitir: ['5'],
          },
        },
      ],
    },
  ],
  modelos: [
    {
      id: 'tetrade-7M',
      titulo: 'Tétrade 7M',
      formato: 'ver-tocar',
      gerador: 'verTetrade',
      params: { qualidade: '7M' },
      bpm: BPM,
      usaTom: true,
      formas: ['A', 'E', 'D'],
      minutos: 2,
    },
    {
      id: 'tetrade-7',
      titulo: 'Tétrade 7',
      formato: 'ver-tocar',
      gerador: 'verTetrade',
      params: { qualidade: '7' },
      bpm: BPM,
      usaTom: true,
      formas: ['A', 'E', 'D'],
      minutos: 2,
    },
    {
      id: 'tetrade-m7',
      titulo: 'Tétrade m7',
      formato: 'ver-tocar',
      gerador: 'verTetrade',
      params: { qualidade: 'm7' },
      bpm: BPM,
      usaTom: true,
      formas: ['A', 'E', 'D'],
      minutos: 2,
    },
    {
      id: 'tetrade-m7b5',
      titulo: 'Tétrade m7(b5)',
      formato: 'ver-tocar',
      gerador: 'verTetrade',
      params: { qualidade: 'm7(b5)' },
      bpm: BPM,
      usaTom: true,
      formas: ['A', 'E', 'D'],
      minutos: 2,
    },
    {
      id: 'tetrade-dim',
      titulo: 'Tétrade diminuta (°)',
      formato: 'ver-tocar',
      gerador: 'verTetrade',
      params: { qualidade: '°' },
      bpm: BPM,
      usaTom: true,
      formas: ['A', 'E', 'D'],
      minutos: 2,
    },
    {
      id: 'tetrade-sem-tonica',
      titulo: 'Tétrade sem a tônica grave',
      formato: 'ver-tocar',
      gerador: 'verTetrade',
      params: { omitir: ['1'] },
      bpm: BPM,
      usaTom: true,
      formas: ['A', 'E', 'D'],
      minutos: 2,
    },
    {
      id: 'tetrade-identificar',
      titulo: 'Que acorde é este?',
      formato: 'identificacao',
      gerador: 'identificarTetrade',
      params: { rodadas: 6 },
      usaTom: true,
      minutos: 2,
    },
    {
      id: 'tetrade-onde-7',
      titulo: 'Onde está a 7ª?',
      formato: 'quiz-braco',
      gerador: 'ondeEstaGrau',
      params: { rodadas: 6, funcoes: ['7'] },
      usaTom: true,
      minutos: 2,
    },
    {
      id: 'tetrade-progressao',
      titulo: 'IIm7 – V7 – I7M em duas regiões',
      formato: 'progressao',
      gerador: 'progressaoRegioes',
      params: { graus: ['IIm', 'V', 'I', 'I'], centros: [4, 9] },
      bpm: { inicial: 70, passo: 4, recuo: 8, minimo: 50 },
      levada: 'balada',
      usaTom: true,
      minutos: 3,
    },
    {
      id: 'tetrade-onde-3',
      titulo: 'Onde está a 3ª?',
      formato: 'quiz-braco',
      gerador: 'ondeEstaGrau',
      params: { rodadas: 6, funcoes: ['3'] },
      usaTom: true,
      minutos: 2,
    },
  ],
  checkpoint: {
    requisitos: [
      {
        modelos: ['tetrade-7M', 'tetrade-7', 'tetrade-m7', 'tetrade-m7b5', 'tetrade-dim'],
        formas: ['E', 'A'],
        minimoLimpos: 2,
      },
    ],
    descricao: '5 qualidades nas formas de E e A, com Limpo em pelo menos 2 tons.',
  },
};
