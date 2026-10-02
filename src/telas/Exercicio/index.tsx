import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { hojeISO, textoRevisao } from '../../agenda/caixas';
import { sortearTom } from '../../agenda/tons';
import { PlayerExercicio } from '../../componentes/PlayerExercicio';
import { buscarModelo } from '../../conteudo';
import { criarAleatorio } from '../../exercicios/aleatorio';
import { gerarExercicio } from '../../exercicios';
import { chaveItem, type FormaCaged } from '../../exercicios/tipos';
import { useProgresso } from '../../estado/progresso';
import { formatarNota, TONS } from '../../teoria/notas';
import type { ItemProgresso } from '../../tipos';
import css from './Exercicio.module.css';

/** Exercício avulso: /exercicio/:modelo/:tom?/:forma? */
export function Exercicio() {
  const params = useParams<{ modelo: string; tom?: string; forma?: string }>();
  const [, navegar] = useLocation();
  const { progresso, ajustes, registrarAvaliacao } = useProgresso();
  const modelo = buscarModelo(params.modelo);

  const tomInicial = params.tom && TONS.includes(params.tom) ? params.tom : 'C';
  const [tom, setTom] = useState(tomInicial);
  const forma = (params.forma as FormaCaged | undefined) ?? modelo?.formas?.[0];
  const [semente, setSemente] = useState(() => Date.now());
  const [feito, setFeito] = useState<ItemProgresso | null>(null);

  const exercicio = useMemo(
    () => (modelo ? gerarExercicio(modelo, { tom, semente, ...(forma ? { forma } : {}) }) : null),
    [modelo, tom, forma, semente],
  );

  const sair = useCallback(() => navegar('/trilha'), [navegar]);

  const proximo = useCallback(() => {
    if (!modelo) return;
    if (modelo.usaTom) {
      const chave = chaveItem(modelo.id, tom, forma ?? '-');
      const jaLimpo = (progresso.itens[chave]?.limpos ?? 0) > 0;
      // Conteúdo novo fica em C até o primeiro Limpo.
      if (jaLimpo || tom !== 'C') setTom(sortearTom(criarAleatorio(Date.now()), [tom]));
    }
    setSemente(Date.now());
    setFeito(null);
  }, [modelo, tom, forma, progresso.itens]);

  useEffect(() => {
    if (!feito) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        proximo();
      }
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [feito, proximo]);

  if (!modelo || !exercicio) {
    return (
      <main className={css.vazio}>
        <h1>Exercício não encontrado</h1>
        <button className="btn" onClick={sair}>
          Voltar à trilha
        </button>
      </main>
    );
  }

  const item = progresso.itens[exercicio.chave];
  const bpmInicial = item?.bpm ?? exercicio.bpm.inicial;

  return (
    <PlayerExercicio
      key={exercicio.chave + semente}
      exercicio={{
        ...exercicio,
        titulo:
          exercicio.tom !== '-'
            ? `${exercicio.titulo} · ${formatarNota(exercicio.tom, ajustes.nomesNotas)}`
            : exercicio.titulo,
      }}
      bpmInicial={bpmInicial}
      aoAvaliar={(a, bpm) => setFeito(registrarAvaliacao(exercicio.chave, a, bpm))}
      aoSair={sair}
      rodape={
        feito ? (
          <div className={css.feito} role="status">
            <p>
              <strong>Salvo.</strong> Revisão{' '}
              {textoRevisao(feito.proximaRevisao, hojeISO(new Date()))}
              {feito.bpm ? <span className="num"> · próximo BPM {feito.bpm}</span> : null}
            </p>
            <div className={css.acoes}>
              <button
                className="btn"
                onClick={() => {
                  setSemente(Date.now());
                  setFeito(null);
                }}
              >
                Repetir
              </button>
              <button className="btn btn-primario" onClick={proximo}>
                Próximo <kbd className={css.kbd}>Enter</kbd>
              </button>
            </div>
          </div>
        ) : undefined
      }
    />
  );
}
