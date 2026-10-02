import { embaralhar, escolher } from './aleatorio';
import {
  BPM_PADRAO,
  chaveItem,
  type CartaIdentificacao,
  type ContextoGeracao,
  type ExercicioConcreto,
  type Levada,
  type ModeloExercicio,
  type PassoProgressao,
} from './tipos';
import { acorde, papelDaFuncao, type AcordeInfo } from '../teoria/acordes';
import { cadencia, campoHarmonico, relativaMaior, relativaMenor } from '../teoria/campo';
import { cifra } from '../teoria/cifra';
import type { Marcador } from '../teoria/marcador';
import { croma, TONS, type ClasseNota } from '../teoria/notas';
import { voicingNaRegiao } from '../teoria/voicings';

/** Um passo de progressão: voicing perto da região + baixo + pad. */
export function passoDe(
  ac: AcordeInfo,
  grau: string,
  centro: number,
  tempos: number,
): PassoProgressao {
  const v = voicingNaRegiao(ac.fundamental, ac.qualidade, centro);
  const marcadores: Marcador[] = v.posicoes
    .slice()
    .sort((a, b) => b.corda - a.corda)
    .map((p) => ({
      corda: p.corda,
      casa: p.casa,
      midi: p.midi,
      papel: papelDaFuncao(p.funcao),
      nota: p.nota,
      grau: p.grau,
      intervalo: p.intervalo,
    }));
  // Inversões (ex.: G7/B): a guitarra mantém o voicing em posição fundamental;
  // só o baixo sintetizado toca a nota invertida. Baixo na oitava de C2 (MIDI 36–47).
  const baixo = 36 + croma(ac.baixo ?? ac.fundamental);
  return {
    cifra: cifra(ac),
    grau,
    midi: v.posicoes.map((p) => p.midi).sort((a, b) => a - b),
    baixo,
    marcadores,
    faixa: v.faixa,
    tempos,
  };
}

function exercicioProgressao(
  modelo: ModeloExercicio,
  tom: ClasseNota,
  instrucao: string,
  passos: PassoProgressao[],
): ExercicioConcreto {
  return {
    chave: chaveItem(modelo.id, tom, '-'),
    modeloId: modelo.id,
    formato: 'progressao',
    titulo: modelo.titulo,
    tom,
    forma: '-',
    instrucao,
    marcadores: passos[0]?.marcadores ?? [],
    progressao: passos,
    bpm: modelo.bpm ?? { ...BPM_PADRAO, inicial: 70 },
    levada: (modelo.levada ?? 'nenhuma') as Levada,
  };
}

/** Cadência por graus sobre a base. params: { graus, centro?, tempos? } */
export function progressaoCadencia(
  modelo: ModeloExercicio,
  ctx: ContextoGeracao,
): ExercicioConcreto {
  const graus = modelo.params.graus as string[];
  const centro = (modelo.params.centro as number | undefined) ?? 5;
  const tempos = (modelo.params.tempos as number | undefined) ?? 4;
  const passos = cadencia(ctx.tom, graus).map((c) => passoDe(c.acorde, c.grau, centro, tempos));
  return exercicioProgressao(modelo, ctx.tom, `${graus.join(' – ')} em {n:${ctx.tom}}`, passos);
}

/** O campo inteiro em tétrades, I a VII, numa região. */
export function tocarCampo(modelo: ModeloExercicio, ctx: ContextoGeracao): ExercicioConcreto {
  const centro = (modelo.params.centro as number | undefined) ?? 5;
  const passos = campoHarmonico(ctx.tom, 'tetrade').map((g) =>
    passoDe(g.acorde, g.rotulo, centro, 4),
  );
  return exercicioProgressao(
    modelo,
    ctx.tom,
    `Campo de {n:${ctx.tom}} em tétrades, do I ao VII`,
    passos,
  );
}

/** Mesma sequência em duas regiões do braço (Módulo 1). params: { graus, centros } */
export function progressaoRegioes(
  modelo: ModeloExercicio,
  ctx: ContextoGeracao,
): ExercicioConcreto {
  const graus = modelo.params.graus as string[];
  const centros = (modelo.params.centros as number[] | undefined) ?? [4, 9];
  const cad = cadencia(ctx.tom, graus);
  const passos = centros.flatMap((c) => cad.map((x) => passoDe(x.acorde, x.grau, c, 4)));
  return exercicioProgressao(
    modelo,
    ctx.tom,
    `${cad.map((c) => cifra(c.acorde)).join(' – ')}: região grave, depois aguda`,
    passos,
  );
}

/** Cartas relâmpago: "qual é o V7 de E♭?" e "Dm7 é que grau em C?" em tons sorteados. */
export function identificarGrauCampo(
  modelo: ModeloExercicio,
  ctx: ContextoGeracao,
): ExercicioConcreto {
  const rodadas = (modelo.params.rodadas as number | undefined) ?? 8;
  const cartas: CartaIdentificacao[] = [];
  for (let i = 0; i < rodadas; i++) {
    const tom = escolher(TONS, ctx.rnd);
    const campo = campoHarmonico(tom, 'tetrade');
    const alvo = escolher(campo, ctx.rnd);
    const outros = embaralhar(
      campo.filter((g) => g !== alvo),
      ctx.rnd,
    ).slice(0, 3);
    if (i % 2 === 0) {
      cartas.push({
        pergunta: `Qual é o ${alvo.rotulo} de {n:${tom}}?`,
        opcoes: embaralhar([alvo, ...outros], ctx.rnd).map((g) => cifra(g.acorde)),
        resposta: cifra(alvo.acorde),
      });
    } else {
      cartas.push({
        pergunta: `${cifra(alvo.acorde)} é que grau em {n:${tom}}?`,
        opcoes: embaralhar([alvo, ...outros], ctx.rnd).map((g) => g.rotulo),
        resposta: alvo.rotulo,
      });
    }
  }
  return cartasExercicio(modelo, cartas, 'Responda rápido');
}

/** Cartas de relativas, nos dois sentidos (C ↔ Am). */
export function relativas(modelo: ModeloExercicio, ctx: ContextoGeracao): ExercicioConcreto {
  const rodadas = (modelo.params.rodadas as number | undefined) ?? 8;
  const cartas: CartaIdentificacao[] = [];
  const tons = embaralhar(TONS, ctx.rnd);
  for (let i = 0; i < rodadas; i++) {
    const tom = tons[i % tons.length]!;
    const menor = relativaMenor(tom);
    const maior = cifra(acorde(tom, ''));
    const m = cifra(acorde(menor, 'm'));
    const outrosTons = embaralhar(
      TONS.filter((t) => t !== tom),
      ctx.rnd,
    ).slice(0, 3);
    if (i % 2 === 0) {
      cartas.push({
        pergunta: `Relativa menor de ${maior}?`,
        opcoes: embaralhar(
          [m, ...outrosTons.map((t) => cifra(acorde(relativaMenor(t), 'm')))],
          ctx.rnd,
        ),
        resposta: m,
      });
    } else {
      cartas.push({
        pergunta: `Relativa maior de ${m}?`,
        opcoes: embaralhar(
          [maior, ...outrosTons.map((t) => cifra(acorde(relativaMaior(relativaMenor(t)), '')))],
          ctx.rnd,
        ),
        resposta: maior,
      });
    }
  }
  return cartasExercicio(modelo, cartas, 'Relativas');
}

function cartasExercicio(
  modelo: ModeloExercicio,
  cartas: CartaIdentificacao[],
  instrucao: string,
): ExercicioConcreto {
  return {
    chave: chaveItem(modelo.id, '-', '-'),
    modeloId: modelo.id,
    formato: 'identificacao',
    titulo: modelo.titulo,
    tom: '-',
    forma: '-',
    instrucao,
    marcadores: [],
    cartas,
    bpm: BPM_PADRAO,
  };
}
