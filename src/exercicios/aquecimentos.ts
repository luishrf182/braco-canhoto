import { escolher } from './aleatorio';
import {
  chaveItem,
  type ContextoGeracao,
  type EventoSequencia,
  type ExercicioConcreto,
  type ModeloExercicio,
} from './tipos';
import type { Marcador } from '../teoria/marcador';
import {
  posicaoEscala,
  type NotaEscala,
  type PosicaoEscala,
  type TipoEscala,
} from '../teoria/escalas';
import type { Corda } from '../teoria/notas';

export type Ritmo = 'colcheias' | 'tercinas' | 'semicolcheias';
export const RITMOS: Ritmo[] = ['colcheias', 'tercinas', 'semicolcheias'];
/** Duração de cada nota, em tempos. */
export const DURACAO_RITMO: Record<Ritmo, number> = {
  colcheias: 1 / 2,
  tercinas: 1 / 3,
  semicolcheias: 1 / 4,
};

export type TipoAquecimento =
  'independencia' | 'horizontal' | 'duas-cordas' | 'vertical' | 'ligados';

const DESCRICAO: Record<TipoAquecimento, string> = {
  independencia: 'pares de dedos, corda a corda',
  horizontal: 'grupos de 4 notas subindo e descendo',
  'duas-cordas': 'grupos de 3 notas em pares de cordas',
  vertical: 'célula de 4 notas descendo as cordas',
  ligados: 'hammer-on subindo, pull-off descendo',
};

const NOME_ESCALA: Record<TipoEscala, string> = {
  maior: 'escala maior',
  'penta-maior': 'penta maior',
  'penta-menor': 'penta menor',
};

const porCorda = (p: PosicaoEscala, c: Corda) =>
  p.notas.filter((n) => n.corda === c).sort((a, b) => a.casa - b.casa);

/** Sequência de notas (por índice em `p.notas`) de cada tipo de aquecimento. */
export function sequenciaAquecimento(tipo: TipoAquecimento, p: PosicaoEscala): NotaEscala[] {
  const asc = p.notas;
  const desc = [...asc].reverse();
  switch (tipo) {
    case 'independencia': {
      // Cada corda, da grave para a aguda: as duas primeiras notas (um par de dedos), ida e volta.
      const res: NotaEscala[] = [];
      for (const c of [6, 5, 4, 3, 2, 1] as Corda[]) {
        const [a, b] = porCorda(p, c);
        if (a && b) res.push(a, b, a, b);
      }
      return res;
    }
    case 'horizontal': {
      // 1-2-3-4, 2-3-4-5... subindo; depois o mesmo descendo.
      const grupos = (l: NotaEscala[]) => l.slice(0, -3).flatMap((_, i) => l.slice(i, i + 4));
      return [...grupos(asc), ...grupos(desc)];
    }
    case 'duas-cordas': {
      // Pares de cordas vizinhas; grupos de 3 notas alternando as duas cordas.
      const res: NotaEscala[] = [];
      for (let c = 6; c >= 2; c--) {
        const par = [...porCorda(p, c as Corda), ...porCorda(p, (c - 1) as Corda)].sort(
          (a, b) => a.midi - b.midi,
        );
        for (let i = 0; i + 3 <= par.length; i++) res.push(...par.slice(i, i + 3));
      }
      return res;
    }
    case 'vertical': {
      // Célula de 4 notas (2 cordas, 2 notas cada), da aguda para a grave.
      const res: NotaEscala[] = [];
      for (let c = 1; c <= 5; c++) {
        const cel = [
          ...porCorda(p, (c + 1) as Corda).slice(0, 2),
          ...porCorda(p, c as Corda).slice(0, 2),
        ];
        if (cel.length === 4) res.push(...cel.sort((a, b) => b.midi - a.midi));
      }
      return res;
    }
    case 'ligados': {
      // Por corda: grave→aguda (hammer-on) e aguda→grave (pull-off).
      const res: NotaEscala[] = [];
      for (const c of [6, 5, 4, 3, 2, 1] as Corda[]) {
        const n = porCorda(p, c);
        const a = n[0];
        const b = n[n.length - 1];
        if (a && b && a !== b) res.push(a, b, b, a);
      }
      return res;
    }
  }
}

/** Gerador de aquecimento. params: { tipo, escala? } — ritmo sorteado entre os 3. */
export function aquecimento(modelo: ModeloExercicio, ctx: ContextoGeracao): ExercicioConcreto {
  const tipo = modelo.params.tipo as TipoAquecimento;
  const escala = (modelo.params.escala as TipoEscala | undefined) ?? 'penta-menor';
  const forma = ctx.forma ?? 'E';
  const ritmo = (modelo.params.ritmo as Ritmo | undefined) ?? escolher(RITMOS, ctx.rnd);
  const p = posicaoEscala(ctx.tom, escala, forma);
  const seq = sequenciaAquecimento(tipo, p);

  const casaBase = Math.min(...p.notas.filter((n) => n.casa > 0).map((n) => n.casa));
  const marcadores: Marcador[] = p.notas.map((n) => ({
    corda: n.corda,
    casa: n.casa,
    midi: n.midi,
    papel: n.grau === 1 ? 'fundamental' : 'escala',
    nota: n.nota,
    grau: String(n.grau),
    // Um dedo por casa a partir da casa mais grave da forma (corda solta = 0).
    dedo: n.casa === 0 ? 0 : Math.min(4, Math.max(1, n.casa - casaBase + 1)),
  }));
  const indice = (n: NotaEscala) => p.notas.indexOf(n);
  const dur = DURACAO_RITMO[ritmo];
  const eventos: EventoSequencia[] = seq.map((n) => ({
    midi: n.midi,
    duracao: dur,
    indice: indice(n),
  }));

  return {
    chave: chaveItem(modelo.id, ctx.tom, forma),
    modeloId: modelo.id,
    formato: modelo.formato,
    titulo: modelo.titulo,
    tom: ctx.tom,
    forma,
    instrucao: `{n:${ctx.tom}} ${NOME_ESCALA[escala]}, forma de ${forma}: ${DESCRICAO[tipo]} (${ritmo})`,
    marcadores,
    faixa: p.janela[0] === 0 ? [0, 5] : [p.janela[0] - 1, p.janela[1] + 1],
    sombra: p.janela,
    eventos,
    loop: true,
    clique: true,
    ritmo,
    bpm: modelo.bpm ?? { inicial: 60, passo: 4, recuo: 8, minimo: 40 },
  };
}
