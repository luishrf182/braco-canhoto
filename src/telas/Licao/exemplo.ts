import type { ExemploConceito } from '../../conteudo/tipos';
import { passoDe } from '../../exercicios/campo';
import type { EventoSequencia, PassoProgressao } from '../../exercicios/tipos';
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
  throw new Error(`Exemplo ainda não suportado: ${ex.tipo}`);
}
