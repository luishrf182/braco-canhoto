import { useMemo, useState } from 'react';
import { Braco, type Marcador } from '../../componentes/Braco';
import { SeletorTom } from '../../componentes/SeletorTom';
import { useProgresso } from '../../estado/progresso';
import { formatarNota, posicoesDe, type ClasseNota } from '../../teoria/notas';
import css from './Explorar.module.css';

export function Explorar() {
  const { ajustes } = useProgresso();
  const [nota, setNota] = useState<ClasseNota>('C');

  const marcadores = useMemo<Marcador[]>(
    () => posicoesDe(nota).map((p) => ({ ...p, papel: 'fundamental', nota })),
    [nota],
  );

  const nome = formatarNota(nota, ajustes.nomesNotas);

  return (
    <div className={css.tela}>
      <div className={css.cabecalho}>
        <h1>Explorar</h1>
        <p className="mudo">Todas as notas {nome}, da casa 0 à 15.</p>
      </div>
      <SeletorTom valor={nota} aoMudar={setNota} rotulo="Nota" />
      <div className={css.areaBraco}>
        <Braco
          marcadores={marcadores}
          rotulo="nota"
          descricao={`Todas as notas ${nome} no braço`}
        />
      </div>
    </div>
  );
}
