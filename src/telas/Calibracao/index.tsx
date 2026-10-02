import { useLocation } from 'wouter';
import { Braco, type Marcador } from '../../componentes/Braco';
import { useProgresso } from '../../estado/progresso';
import { posicao } from '../../teoria/notas';
import css from './Calibracao.module.css';

// Referência visual: as cordas soltas e o Sol na 3ª casa do Mi grave.
const REFERENCIA: Marcador[] = [
  { ...posicao(6, 0), papel: 'escala' },
  { ...posicao(6, 3), papel: 'fundamental' },
  { ...posicao(1, 0), papel: 'escala' },
];

export function Calibracao() {
  const { ajustes, atualizarAjustes } = useProgresso();
  const [, navegar] = useLocation();

  return (
    <main className={css.tela}>
      <div className={css.topo}>
        <h1>É assim que você vê sua guitarra?</h1>
        <p className="mudo">
          Olhe para baixo, na posição de tocar. A pestana e o Mi grave devem ficar do mesmo lado que
          na tela.
        </p>
      </div>

      <div className={css.areaBraco}>
        <Braco
          marcadores={REFERENCIA}
          faixa={[0, 7]}
          rotulo="nota"
          descricao="Braço de referência para calibrar a orientação"
        />
      </div>

      <div className={css.controles}>
        <button
          className="btn"
          aria-pressed={ajustes.espelhoHorizontal}
          onClick={() => atualizarAjustes({ espelhoHorizontal: !ajustes.espelhoHorizontal })}
        >
          <span aria-hidden="true">↔</span> Inverter lados
        </button>
        <button
          className="btn"
          aria-pressed={ajustes.espelhoVertical}
          onClick={() => atualizarAjustes({ espelhoVertical: !ajustes.espelhoVertical })}
        >
          <span aria-hidden="true">↕</span> Inverter cordas
        </button>
        <button
          className="btn btn-primario"
          onClick={() => {
            atualizarAjustes({ calibrado: true });
            navegar(ajustes.diagnosticoVisto ? '/hoje' : '/diagnostico', { replace: true });
          }}
        >
          Sim, é assim
        </button>
      </div>
    </main>
  );
}
