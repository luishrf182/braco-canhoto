import type { ExemploConceito } from '../../conteudo/tipos';
import { passoDe } from '../../exercicios/campo';
import type { EventoSequencia, PassoProgressao } from '../../exercicios/tipos';
import { arpejo } from '../../teoria/arpejos';
import { cadencia, campoHarmonico } from '../../teoria/campo';
import { acorde, papelDaFuncao } from '../../teoria/acordes';
import { cifra } from '../../teoria/cifra';
import type { Marcador, Papel } from '../../teoria/marcador';
import { janelaDoVoicing, marcadoresDoVoicing, voicing } from '../../teoria/voicings';

export interface DadosExemplo {
  titulo: string;
  chips: { nota: string; grau: string; papel: Papel }[];
  marcadores: Marcador[];
  faixa?: [number, number];
  sombra?: [number, number];
  eventos: EventoSequencia[];
  /** Exemplos com vários acordes (campo, cadência): um passo por acorde. */
  passos?: PassoProgressao[];
}

/** Converte o exemplo declarado no conteúdo em dados do motor (nada escrito à mão). */
export function exemploMusical(ex: ExemploConceito): DadosExemplo {
  if (ex.tipo === 'voicing' || ex.tipo === 'notas-acorde') {
    const forma = ex.tipo === 'voicing' ? ex.forma : 'A';
    const opc =
      ex.tipo === 'voicing'
        ? {
            ...(ex.abertura ? { abertura: ex.abertura } : {}),
            ...(ex.omitir ? { omitir: ex.omitir } : {}),
          }
        : {};
    const v = voicing(ex.tom, ex.qualidade, forma, opc);
    const marcadores = marcadoresDoVoicing(v);
    const ordem = marcadores.map((m, i) => ({ m, i })).sort((a, b) => a.m.midi! - b.m.midi!);
    const info = acorde(ex.tom, ex.qualidade);
    return {
      titulo:
        ex.tipo === 'voicing'
          ? `${cifra(info)} · forma de ${ex.forma}${v.abertura ? ` · abertura ${v.abertura}` : ''}`
          : cifra(info),
      chips:
        ex.tipo === 'notas-acorde'
          ? info.notas.map((n) => ({ nota: n.nota, grau: n.grau, papel: papelDaFuncao(n.funcao) }))
          : [],
      marcadores,
      faixa: janelaDoVoicing(v),
      eventos: [
        { midi: ordem.map(({ m }) => m.midi!), duracao: 2 },
        ...ordem.map(({ m, i }) => ({ midi: m.midi!, indice: i })),
      ],
    };
  }
  if (ex.tipo === 'campo' || ex.tipo === 'cadencia') {
    const passos =
      ex.tipo === 'campo'
        ? campoHarmonico(ex.tom, 'tetrade').map((g) => passoDe(g.acorde, g.rotulo, 5, 2))
        : cadencia(ex.tom, ex.graus).map((c) => passoDe(c.acorde, c.grau, 5, 2));
    return {
      titulo: ex.tipo === 'campo' ? `Campo harmônico de {n:${ex.tom}}` : ex.graus.join(' – '),
      chips: [],
      marcadores: passos[0]!.marcadores,
      eventos: passos.map((p, i) => ({ midi: p.midi, duracao: 2, indice: i })),
      passos,
    };
  }
  if (ex.tipo === 'arpejo' || ex.tipo === 'conexao') {
    const formas = ex.tipo === 'arpejo' ? [ex.forma] : ex.formas;
    const arps = formas
      .map((f) => arpejo(ex.tom, ex.qualidade, f))
      .sort((a, b) => a.janela[0] - b.janela[0]);
    const marcadores: Marcador[] = [];
    const pos = new Map<string, number>();
    for (const a of arps)
      for (const m of a.marcadores) {
        const k = `${m.corda}:${m.casa}`;
        if (!pos.has(k)) {
          pos.set(k, marcadores.length);
          marcadores.push(m);
        }
      }
    const eventos: EventoSequencia[] = arps.flatMap((a, k) =>
      (k % 2 === 0 ? a.marcadores : [...a.marcadores].reverse()).map((m) => ({
        midi: m.midi!,
        indice: pos.get(`${m.corda}:${m.casa}`)!,
        duracao: 1 / 2,
      })),
    );
    const nome = cifra(acorde(ex.tom, ex.qualidade));
    const um = arps[0]!;
    return {
      titulo:
        ex.tipo === 'arpejo'
          ? `Arpejo de ${nome} · forma de ${ex.forma}`
          : `${nome} nas formas ${arps.map((a) => a.forma).join(' → ')}`,
      chips: [],
      marcadores,
      ...(ex.tipo === 'arpejo'
        ? {
            faixa: (um.janela[0] === 0 ? [0, 5] : [um.janela[0] - 1, um.janela[1] + 1]) as [
              number,
              number,
            ],
            sombra: um.janela,
          }
        : {}),
      eventos,
    };
  }
  throw new Error(`Exemplo ainda não suportado: ${JSON.stringify(ex)}`);
}
