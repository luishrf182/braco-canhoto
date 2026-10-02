import { embaralhar, type Aleatorio } from '../exercicios/aleatorio';
import type { ItemProgresso } from '../tipos';
import { sortearTom } from './tons';

/** O que a agenda precisa saber de um modelo de exercício. */
export interface ModeloAgenda {
  id: string;
  formas?: string[];
  usaTom?: boolean;
  minutos?: number;
}

export interface ModuloAgenda {
  id: string;
  licoes: { id: string; minutos?: number }[];
  modelos: ModeloAgenda[];
  checkpointCompleto: boolean;
}

export type Motivo = 'aquecimento' | 'novo' | 'revisao';

export type ItemSessao =
  | {
      tipo: 'exercicio';
      modeloId: string;
      tom: string;
      forma: string;
      motivo: Motivo;
      minutos: number;
    }
  | { tipo: 'licao'; modulo: string; licao: string; motivo: 'novo'; minutos: number };

export interface EntradaSessao {
  modulos: ModuloAgenda[];
  aquecimentos: ModeloAgenda[];
  /** Outros modelos cujos itens podem voltar como revisão (ex.: lacunas do diagnóstico). */
  extras?: ModeloAgenda[];
  itens: Record<string, ItemProgresso>;
  /** Lições já vistas: `${modulo}/${licao}` → data. */
  licoesVistas: Record<string, string>;
  hoje: string;
  minutos: 10 | 20 | 30;
  rnd: Aleatorio;
}

/** Fatias da sessão (BLUEPRINT §7.4): aquecimento ~20%, novos ~40%, revisão ~40%. */
export function orcamento(minutos: number) {
  const aquecimento = Math.max(2, Math.round(minutos * 0.2));
  const resto = minutos - aquecimento;
  return { aquecimento, novo: Math.round(resto / 2), revisao: resto - Math.round(resto / 2) };
}

const minutosDe = (m: ModeloAgenda) => m.minutos ?? 2;
const formasDe = (m: ModeloAgenda) => (m.formas?.length ? m.formas : ['-']);

export function chaveDe(modeloId: string, tom: string, forma: string) {
  return `${modeloId}|${tom}|${forma}`;
}

function partes(chave: string) {
  const [modeloId = '', tom = '-', forma = '-'] = chave.split('|');
  return { modeloId, tom, forma };
}

/** Itens com revisão vencida, mais urgentes primeiro (data, depois caixa mais baixa). */
export function revisoesPendentes(
  itens: Record<string, ItemProgresso>,
  hoje: string,
  conhecidos: Set<string>,
): string[] {
  return Object.entries(itens)
    .filter(([k, i]) => i.proximaRevisao <= hoje && conhecidos.has(partes(k).modeloId))
    .sort(
      ([ka, a], [kb, b]) =>
        a.proximaRevisao.localeCompare(b.proximaRevisao) ||
        a.caixa - b.caixa ||
        ka.localeCompare(kb),
    )
    .map(([k]) => k);
}

/** Reordena evitando o mesmo modelo duas vezes seguidas (revisão intercalada). */
export function intercalar<T>(lista: T[], grupo: (t: T) => string): T[] {
  const restantes = [...lista];
  const res: T[] = [];
  while (restantes.length) {
    const ultimo = res.length ? grupo(res[res.length - 1]!) : null;
    const idx = restantes.findIndex((t) => grupo(t) !== ultimo);
    res.push(restantes.splice(idx >= 0 ? idx : 0, 1)[0]!);
  }
  return res;
}

/** Módulo que recebe conteúdo novo: o primeiro cujo checkpoint ainda não foi concluído. */
export function moduloAtivo(modulos: ModuloAgenda[]): ModuloAgenda | undefined {
  return modulos.find((m) => !m.checkpointCompleto) ?? modulos[modulos.length - 1];
}

/**
 * Candidatos a conteúdo novo, em ordem:
 * 1) lições ainda não vistas; 2) combinações modelo × forma nunca feitas (sempre em C);
 * 3) variantes de tom de combinações que já tiveram Limpo.
 */
export function candidatosNovos(e: EntradaSessao): ItemSessao[] {
  const mod = moduloAtivo(e.modulos);
  if (!mod) return [];
  const res: ItemSessao[] = [];
  // Uma lição nova por sessão: o resto do tempo é prática.
  const licao = mod.licoes.find((l) => !e.licoesVistas[`${mod.id}/${l.id}`]);
  if (licao) {
    res.push({
      tipo: 'licao',
      modulo: mod.id,
      licao: licao.id,
      motivo: 'novo',
      minutos: licao.minutos ?? 2,
    });
  }
  const variantes: ItemSessao[] = [];
  for (const m of mod.modelos) {
    for (const forma of formasDe(m)) {
      const feitos = Object.entries(e.itens).filter(([k]) => {
        const p = partes(k);
        return p.modeloId === m.id && p.forma === forma;
      });
      if (!feitos.length) {
        res.push({
          tipo: 'exercicio',
          modeloId: m.id,
          tom: 'C',
          forma,
          motivo: 'novo',
          minutos: minutosDe(m),
        });
        continue;
      }
      const algumLimpo = feitos.some(([, i]) => (i.limpos ?? 0) > 0);
      if (algumLimpo && m.usaTom) {
        const vistos = feitos.map(([k]) => partes(k).tom);
        if (vistos.length < 12) {
          variantes.push({
            tipo: 'exercicio',
            modeloId: m.id,
            tom: sortearTom(e.rnd, vistos),
            forma,
            motivo: 'novo',
            minutos: minutosDe(m),
          });
        }
      }
    }
  }
  return [...res, ...embaralhar(variantes, e.rnd)];
}

/** Monta a Sessão do dia. Função pura: mesma entrada (e semente) → mesma sessão. */
export function montarSessao(e: EntradaSessao): ItemSessao[] {
  const orc = orcamento(e.minutos);
  const conhecidos = new Set([
    ...e.modulos.flatMap((m) => m.modelos.map((x) => x.id)),
    ...e.aquecimentos.map((x) => x.id),
    ...(e.extras ?? []).map((x) => x.id),
  ]);
  const porId = new Map(
    [...e.modulos.flatMap((m) => m.modelos), ...e.aquecimentos, ...(e.extras ?? [])].map((m) => [
      m.id,
      m,
    ]),
  );

  // Aquecimento
  const aquecimento: ItemSessao[] = [];
  let t = 0;
  for (const m of embaralhar(e.aquecimentos, e.rnd)) {
    if (t >= orc.aquecimento) break;
    const forma = formasDe(m)[Math.floor(e.rnd() * formasDe(m).length)]!;
    aquecimento.push({
      tipo: 'exercicio',
      modeloId: m.id,
      tom: m.usaTom ? sortearTom(e.rnd) : '-',
      forma,
      motivo: 'aquecimento',
      minutos: minutosDe(m),
    });
    t += minutosDe(m);
  }

  // Revisão (exclui aquecimentos: eles já entram todo dia)
  const idsAquecimento = new Set(e.aquecimentos.map((a) => a.id));
  const pendentes = revisoesPendentes(e.itens, e.hoje, conhecidos).filter(
    (k) => !idsAquecimento.has(partes(k).modeloId),
  );
  const candidatos = candidatosNovos(e);
  // Sem conteúdo novo disponível, a revisão ocupa também o tempo dos novos.
  const alvoRevisao = orc.revisao + (candidatos.length ? 0 : orc.novo);
  const revisao: ItemSessao[] = [];
  let tr = 0;
  for (const k of pendentes) {
    const p = partes(k);
    const m = porId.get(p.modeloId);
    if (!m) continue;
    if (tr >= alvoRevisao) break;
    revisao.push({ tipo: 'exercicio', ...p, motivo: 'revisao', minutos: minutosDe(m) });
    tr += minutosDe(m);
  }

  // Novos: completam o tempo que a revisão não usou
  const alvoNovo = orc.novo + Math.max(0, orc.revisao - tr);
  const novos: ItemSessao[] = [];
  let tn = 0;
  const usados = new Set(revisao.map((r) => (r.tipo === 'exercicio' ? r.modeloId + r.forma : '')));
  for (const c of candidatos) {
    if (tn >= alvoNovo) break;
    if (c.tipo === 'exercicio' && usados.has(c.modeloId + c.forma)) continue;
    novos.push(c);
    if (c.tipo === 'exercicio') usados.add(c.modeloId + c.forma);
    tn += c.minutos;
  }

  // Intercala: novo, revisão, novo, revisão... (lição sempre antes dos exercícios novos)
  const revInter = intercalar(revisao, (r) => (r.tipo === 'exercicio' ? r.modeloId : r.licao));
  const corpo: ItemSessao[] = [];
  let i = 0;
  let j = 0;
  while (i < novos.length || j < revInter.length) {
    if (i < novos.length) {
      corpo.push(novos[i++]!);
      // Depois de uma lição, emenda o próximo novo antes da revisão.
      if (corpo[corpo.length - 1]!.tipo === 'licao' && i < novos.length) corpo.push(novos[i++]!);
    }
    if (j < revInter.length) corpo.push(revInter[j++]!);
  }
  return [...aquecimento, ...corpo];
}

export function duracao(itens: ItemSessao[]): number {
  return itens.reduce((s, i) => s + i.minutos, 0);
}
