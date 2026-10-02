import type { ExemploConceito } from '../../conteudo/tipos';
import type { EventoSequencia } from '../../exercicios/tipos';
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
  throw new Error(`Exemplo ainda não suportado: ${ex.tipo}`);
}
