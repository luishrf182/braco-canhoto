import { useCallback, useEffect, useMemo, useState } from 'react';
import { Redirect, useLocation } from 'wouter';
import { hojeISO } from '../../agenda/caixas';
import { PlayerExercicio } from '../../componentes/PlayerExercicio';
import { buscarModelo } from '../../conteudo';
import { gerarExercicio } from '../../exercicios';
import type { FormaCaged } from '../../exercicios/tipos';
import { useProgresso } from '../../estado/progresso';
import { sementeDoDia, tituloItem } from '../../estado/sessao';
import { gravarSessao, lerSessao, type SessaoAtual } from '../../progresso/sessaoAtual';
import type { Avaliacao, ResumoSessao } from '../../tipos';
import { LicaoConteudo } from '../Licao';

/** Executa a Sessão do dia item a item; o andamento fica salvo no aparelho. */
export function Sessao() {
  const [, navegar] = useLocation();
  const { progresso, ajustes, registrarAvaliacao, atualizar } = useProgresso();
  const [sessao, setSessaoEstado] = useState<SessaoAtual | null>(() => lerSessao());

  const setSessao = useCallback((s: SessaoAtual) => {
    gravarSessao(s);
    setSessaoEstado(s);
  }, []);

  const item = sessao && !sessao.concluida ? sessao.itens[sessao.indice] : undefined;
  const posicao = sessao ? `${sessao.indice + 1} de ${sessao.itens.length}` : '';

  const exercicio = useMemo(() => {
    if (!sessao || item?.tipo !== 'exercicio') return null;
    const modelo = buscarModelo(item.modeloId);
    if (!modelo) return null;
    return gerarExercicio(modelo, {
      ...(item.tom !== '-' ? { tom: item.tom } : {}),
      ...(item.forma !== '-' ? { forma: item.forma as FormaCaged } : {}),
      semente: sementeDoDia(sessao.id, sessao.indice),
    });
  }, [sessao, item]);

  const avancar = useCallback(
    (s: SessaoAtual) => {
      const prox = s.indice + 1;
      if (prox < s.itens.length) {
        setSessao({ ...s, indice: prox });
        return;
      }
      const resumo: ResumoSessao = {
        id: s.id,
        data: s.data,
        minutos: s.minutos,
        itens: s.resultados.map((r) => ({
          chave: r.chave,
          avaliacao: r.avaliacao,
          ...(r.bpm !== undefined ? { bpm: r.bpm } : {}),
        })),
      };
      atualizar((p) => ({
        ...p,
        sessoes: [...p.sessoes.filter((x) => x.id !== s.id), resumo].slice(-60),
      }));
      setSessao({ ...s, indice: prox, concluida: true });
      navegar('/resultado', { replace: true });
    },
    [atualizar, navegar, setSessao],
  );

  // Modelo removido do conteúdo desde que a sessão foi montada: pula.
  const faltaModelo = item?.tipo === 'exercicio' && !exercicio;
  useEffect(() => {
    if (faltaModelo && sessao) avancar(sessao);
  }, [faltaModelo, sessao, avancar]);

  if (!sessao || sessao.concluida) return <Redirect to="/hoje" replace />;
  if (!item) return <Redirect to="/hoje" replace />;

  const sair = () => navegar('/hoje');

  if (item.tipo === 'licao') {
    return (
      <LicaoConteudo
        key={`${sessao.id}-${sessao.indice}`}
        moduloId={item.modulo}
        licaoId={item.licao}
        posicao={posicao}
        aoConcluir={() => avancar(sessao)}
        aoSair={sair}
      />
    );
  }

  if (!exercicio) return null;

  const anterior = progresso.itens[exercicio.chave];
  const bpmInicial = anterior?.bpm ?? exercicio.bpm.inicial;
  const titulo = tituloItem(item, ajustes.nomesNotas);

  return (
    <PlayerExercicio
      key={`${sessao.id}-${sessao.indice}`}
      exercicio={{ ...exercicio, titulo }}
      bpmInicial={bpmInicial}
      posicao={posicao}
      aoSair={sair}
      aoAvaliar={(avaliacao: Avaliacao, bpm: number) => {
        const usaBpm = exercicio.formato !== 'quiz-braco' && exercicio.formato !== 'identificacao';
        const novo = registrarAvaliacao(exercicio.chave, avaliacao, usaBpm ? bpm : undefined);
        const s: SessaoAtual = {
          ...sessao,
          resultados: [
            ...sessao.resultados,
            {
              chave: exercicio.chave,
              titulo,
              avaliacao,
              ...(usaBpm ? { bpm } : {}),
              ...(anterior?.bpm !== undefined ? { bpmAntes: anterior.bpm } : {}),
              ...(anterior ? { caixaAntes: anterior.caixa } : {}),
              caixaDepois: novo.caixa,
              proximaRevisao: novo.proximaRevisao,
            },
          ],
        };
        avancar(s);
      }}
    />
  );
}

/** Cria e grava uma nova sessão a partir do plano. */
export function iniciarSessao(
  itens: SessaoAtual['itens'],
  minutos: number,
  agora = new Date(),
): SessaoAtual {
  const s: SessaoAtual = {
    id: `${hojeISO(agora)}-${agora.getTime().toString(36)}`,
    data: hojeISO(agora),
    minutos,
    itens,
    indice: 0,
    resultados: [],
    concluida: false,
  };
  gravarSessao(s);
  return s;
}
