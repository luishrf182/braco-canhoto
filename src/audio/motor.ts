// Motor de áudio. Tone.js é carregado sob demanda no primeiro gesto do usuário (ADR-4).
import type * as ToneNS from 'tone';
import { registrarErro } from '../progresso/erros';
import { LEVADAS, toques, type NomeLevada } from './levadas';

type Tone = typeof ToneNS;

export interface EventoNota {
  /** Uma nota ou várias (acorde). */
  midi: number | number[];
  /** Duração em tempos (semínimas). Padrão: 1. */
  duracao?: number;
  /** Índice enviado a `aoTocar` quando o evento soa (ex.: índice do marcador). */
  indice?: number;
}

export interface OpcoesSequencia {
  bpm: number;
  contagem: boolean;
  /** Repete a sequência até `parar()`. */
  loop?: boolean;
  /** Clique de metrônomo junto. */
  clique?: boolean;
  /** Tempos por compasso (para contagem e acento). Padrão 4. */
  tempos?: number;
}

export type EstadoAudio = 'inativo' | 'carregando' | 'pronto' | 'tocando' | 'bloqueado';

let tone: Tone | null = null;
let carregando: Promise<void> | null = null;
let estado: EstadoAudio = 'inativo';
let violao: ToneNS.PolySynth | null = null;
let clique: ToneNS.Synth | null = null;
let agendados: number[] = [];

const ouvintesToque = new Set<(indice: number) => void>();
const ouvintesEstado = new Set<(e: EstadoAudio) => void>();

function mudarEstado(e: EstadoAudio) {
  estado = e;
  ouvintesEstado.forEach((cb) => cb(e));
}

function emitirToque(indice: number) {
  ouvintesToque.forEach((cb) => cb(indice));
}

export function estadoAtual(): EstadoAudio {
  return estado;
}

export function carregado(): boolean {
  return tone !== null;
}

/**
 * O índice do Tone cria um contexto padrão ao ser avaliado, com relógio em Worker via blob,
 * que a CSP do app bloqueia. Definimos antes um contexto com relógio por setTimeout.
 */
async function prepararContexto(): Promise<void> {
  const [{ setContext }, { Context }] = await Promise.all([
    import('tone/build/esm/core/Global.js'),
    import('tone/build/esm/core/context/Context.js'),
  ]);
  setContext(new Context({ clockSource: 'timeout', latencyHint: 'interactive', lookAhead: 0.08 }));
}

/** Só chame após um gesto do usuário (clique/toque/tecla). */
export function iniciar(): Promise<void> {
  if (tone) {
    if (tone.getContext().state !== 'running') {
      return tone
        .start()
        .then(() => mudarEstado('pronto'))
        .catch(() => mudarEstado('bloqueado'));
    }
    return Promise.resolve();
  }
  if (carregando) return carregando;
  mudarEstado('carregando');
  carregando = prepararContexto()
    .then(() => import('tone'))
    .then(async (T) => {
      await T.start();
      const filtro = new T.Filter({
        frequency: 2800,
        type: 'lowpass',
        rolloff: -24,
      }).toDestination();
      violao = new T.PolySynth(T.Synth, {
        oscillator: { type: 'fattriangle', count: 2, spread: 12 },
        envelope: { attack: 0.003, decay: 0.9, sustain: 0.04, release: 0.6 },
        volume: -8,
      }).connect(filtro);
      violao.maxPolyphony = 16;
      clique = new T.Synth({
        oscillator: { type: 'square' },
        envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.02 },
        volume: -14,
      }).toDestination();
      tone = T;
      mudarEstado(T.getContext().state === 'running' ? 'pronto' : 'bloqueado');
    })
    .catch((e) => {
      registrarErro(e);
      carregando = null;
      mudarEstado('bloqueado');
      throw e;
    });
  return carregando;
}

function freq(T: Tone, midi: number) {
  return T.Frequency(midi, 'midi').toFrequency();
}

/** Toca uma nota (ou acorde) agora. */
export function tocarNota(midi: number | number[], duracaoSeg = 1.2): void {
  if (!tone || !violao) return;
  const notas = (Array.isArray(midi) ? midi : [midi]).map((m) => freq(tone!, m));
  violao.triggerAttackRelease(notas, duracaoSeg, tone.now());
}

/** Para tudo (sequência, metrônomo, base). */
export function parar(): void {
  if (!tone) return;
  const transporte = tone.getTransport();
  transporte.stop();
  transporte.cancel(0);
  transporte.loop = false;
  agendados = [];
  violao?.releaseAll();
  kit?.pad.releaseAll();
  if (estado === 'tocando') mudarEstado('pronto');
  emitirToque(-1);
}

/** Muda o andamento sem estalo (rampa curta). */
export function definirBpm(bpm: number): void {
  if (!tone) return;
  tone.getTransport().bpm.rampTo(bpm, 0.15);
}

/**
 * Toca uma sequência de eventos, um após o outro, com contagem de entrada opcional.
 * `aoTocar(indice)` dispara sincronizado com o som (via Tone.Draw).
 */
export function tocarSequencia(eventos: EventoNota[], o: OpcoesSequencia): void {
  if (!tone || !violao || !clique) return;
  const T = tone;
  parar();
  const transporte = T.getTransport();
  const desenho = T.getDraw();
  const tempos = o.tempos ?? 4;
  transporte.bpm.value = o.bpm;
  transporte.position = 0;

  const inicio = o.contagem ? tempos : 0; // em tempos
  const total = eventos.reduce((s, e) => s + (e.duracao ?? 1), 0);
  const ppq = transporte.PPQ;
  const tempo = (t: number) => `${Math.round(t * ppq)}i`; // tempos → ticks (acompanham o BPM)

  if (o.contagem) {
    for (let i = 0; i < tempos; i++) {
      agendados.push(
        transporte.schedule((time) => {
          clique!.triggerAttackRelease(i === 0 ? 1760 : 1320, 0.03, time);
          desenho.schedule(() => emitirToque(-2 - i), time);
        }, tempo(i)),
      );
    }
  }

  let t = 0;
  for (const ev of eventos) {
    const dur = ev.duracao ?? 1;
    const inicioEv = t;
    const notas = (Array.isArray(ev.midi) ? ev.midi : [ev.midi]).map((m) => freq(T, m));
    agendados.push(
      transporte.schedule(
        (time) => {
          const durSeg = T.Time(tempo(dur)).toSeconds() * 0.95;
          violao!.triggerAttackRelease(notas, Math.max(0.25, durSeg), time);
          desenho.schedule(() => emitirToque(ev.indice ?? -1), time);
        },
        tempo(inicio + inicioEv),
      ),
    );
    t += dur;
  }

  if (o.clique) {
    const totalTempos = Math.ceil(total);
    for (let i = 0; i < totalTempos; i++) {
      agendados.push(
        transporte.schedule(
          (time) => {
            clique!.triggerAttackRelease(i % tempos === 0 ? 1760 : 1320, 0.03, time);
          },
          tempo(inicio + i),
        ),
      );
    }
  }

  if (o.loop) {
    transporte.loop = true;
    transporte.loopStart = tempo(inicio);
    transporte.loopEnd = tempo(inicio + total);
  } else {
    agendados.push(
      transporte.schedule(
        (time) => {
          desenho.schedule(() => parar(), time);
        },
        tempo(inicio + total),
      ),
    );
  }

  mudarEstado('tocando');
  transporte.start('+0.05');
}

/** Metrônomo contínuo. */
export function metronomo(bpm: number, tempos = 4): void {
  if (!tone || !clique) return;
  parar();
  const T = tone;
  const transporte = T.getTransport();
  transporte.bpm.value = bpm;
  transporte.position = 0;
  let n = 0;
  agendados.push(
    transporte.scheduleRepeat((time) => {
      const i = n++ % tempos;
      clique!.triggerAttackRelease(i === 0 ? 1760 : 1320, 0.03, time);
      T.getDraw().schedule(() => emitirToque(-2 - i), time);
    }, '4n'),
  );
  mudarEstado('tocando');
  transporte.start('+0.05');
}

export function aoTocar(cb: (indice: number) => void): () => void {
  ouvintesToque.add(cb);
  return () => ouvintesToque.delete(cb);
}

export function aoMudarEstado(cb: (e: EstadoAudio) => void): () => void {
  ouvintesEstado.add(cb);
  return () => ouvintesEstado.delete(cb);
}

/** Acesso ao Tone já carregado (para levadas/sintetizadores da base). */
export function toneCarregado(): Tone | null {
  return tone;
}

// ---------------------------------------------------------------- Base (F7)

export interface AcordeBase {
  /** Notas do pad (região média). */
  midi: number[];
  /** Nota do baixo (fundamental ou inversão). */
  baixo: number;
}

export interface OpcoesBase {
  acordes: AcordeBase[];
  batidasPorAcorde: number;
  levada: NomeLevada | 'nenhuma';
  bpm: number;
  pad: boolean;
  clique: boolean;
  contagem?: boolean;
}

interface Kit {
  bumbo: ToneNS.MembraneSynth;
  caixa: ToneNS.NoiseSynth;
  chimbal: ToneNS.NoiseSynth;
  baixo: ToneNS.MonoSynth;
  pad: ToneNS.PolySynth;
}

let kit: Kit | null = null;

function criarKit(T: Tone): Kit {
  const bumbo = new T.MembraneSynth({
    pitchDecay: 0.04,
    octaves: 6,
    envelope: { attack: 0.001, decay: 0.35, sustain: 0, release: 0.1 },
    volume: -6,
  }).toDestination();
  const filtroCaixa = new T.Filter({ frequency: 1800, type: 'highpass' }).toDestination();
  const caixa = new T.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.16, sustain: 0, release: 0.05 },
    volume: -14,
  }).connect(filtroCaixa);
  const filtroChimbal = new T.Filter({ frequency: 8000, type: 'highpass' }).toDestination();
  const chimbal = new T.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.02 },
    volume: -22,
  }).connect(filtroChimbal);
  const baixo = new T.MonoSynth({
    oscillator: { type: 'triangle' },
    filter: { Q: 1, type: 'lowpass', rolloff: -24 },
    filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.4, baseFrequency: 180, octaves: 2 },
    envelope: { attack: 0.01, decay: 0.3, sustain: 0.6, release: 0.2 },
    volume: -8,
  }).toDestination();
  const filtroPad = new T.Filter({ frequency: 1400, type: 'lowpass' }).toDestination();
  const pad = new T.PolySynth(T.Synth, {
    oscillator: { type: 'fattriangle', count: 3, spread: 18 },
    envelope: { attack: 0.25, decay: 0.4, sustain: 0.7, release: 0.8 },
    volume: -20,
  }).connect(filtroPad);
  pad.maxPolyphony = 12;
  return { bumbo, caixa, chimbal, baixo, pad };
}

/**
 * Base em loop: bateria (levada), baixo, pad e clique. `aoTocar(i)` dispara no início do acorde i.
 * Durante a contagem, `aoTocar` recebe −2, −3... como em `tocarSequencia`.
 */
export function iniciarBase(o: OpcoesBase): void {
  if (!tone || !clique || !o.acordes.length) return;
  const T = tone;
  parar();
  kit ??= criarKit(T);
  const k = kit;
  const transporte = T.getTransport();
  const desenho = T.getDraw();
  transporte.bpm.value = o.bpm;
  transporte.position = 0;
  const lev = o.levada === 'nenhuma' ? null : LEVADAS[o.levada];
  const linhas = lev
    ? {
        bumbo: toques(lev.bumbo),
        caixa: toques(lev.caixa),
        chimbal: toques(lev.chimbal),
        baixo: toques(lev.baixo),
      }
    : null;
  const passosPorAcorde = Math.max(1, Math.round(o.batidasPorAcorde * 4));
  const passosContagem = o.contagem ? 16 : 0;
  const durAcorde = `${Math.round(o.batidasPorAcorde * transporte.PPQ)}i`;
  let s = 0;

  agendados.push(
    transporte.scheduleRepeat((time) => {
      const passo = s++;
      if (passo < passosContagem) {
        if (passo % 4 === 0) {
          clique!.triggerAttackRelease(passo === 0 ? 1760 : 1320, 0.03, time);
          desenho.schedule(() => emitirToque(-2 - passo / 4), time);
        }
        return;
      }
      const p = passo - passosContagem;
      const noCompasso = p % 16;
      const idx = Math.floor(p / passosPorAcorde) % o.acordes.length;
      const ac = o.acordes[idx]!;
      if (p % passosPorAcorde === 0) {
        desenho.schedule(() => emitirToque(idx), time);
        if (o.pad)
          k.pad.triggerAttackRelease(
            ac.midi.map((m) => freq(T, m)),
            durAcorde,
            time,
            0.8,
          );
      }
      if (linhas) {
        const em = (l: { passo: number; forca: number }[]) => l.find((t) => t.passo === noCompasso);
        const b = em(linhas.bumbo);
        if (b) k.bumbo.triggerAttackRelease('C1', '8n', time, b.forca);
        const c = em(linhas.caixa);
        if (c) k.caixa.triggerAttackRelease('16n', time, c.forca);
        const h = em(linhas.chimbal);
        if (h) k.chimbal.triggerAttackRelease('32n', time, h.forca);
        const bx = em(linhas.baixo);
        if (bx) k.baixo.triggerAttackRelease(freq(T, ac.baixo), '8n', time, bx.forca);
      } else if (p % passosPorAcorde === 0) {
        k.baixo.triggerAttackRelease(freq(T, ac.baixo), durAcorde, time, 0.8);
      }
      if (o.clique && p % 4 === 0) {
        clique!.triggerAttackRelease(noCompasso === 0 ? 1760 : 1320, 0.03, time);
      }
    }, '16n'),
  );
  mudarEstado('tocando');
  transporte.start('+0.05');
}
