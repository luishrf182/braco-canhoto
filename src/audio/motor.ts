// Motor de áudio. Tone.js é carregado sob demanda no primeiro gesto do usuário (ADR-4).
import type * as ToneNS from 'tone';
import { registrarErro } from '../progresso/erros';

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
  pararBaseInterna?.();
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

/** Gancho para a base (F7) se limpar junto com `parar()`. */
let pararBaseInterna: (() => void) | null = null;
export function registrarParadaBase(fn: (() => void) | null) {
  pararBaseInterna = fn;
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
