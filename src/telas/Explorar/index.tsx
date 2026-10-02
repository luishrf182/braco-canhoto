import { useMemo, useState } from 'react';
import * as audio from '../../audio/motor';
import { Braco, type Marcador } from '../../componentes/Braco';
import { BarraReproducao } from '../../componentes/BarraReproducao';
import { SeletorTom } from '../../componentes/SeletorTom';
import { useTocandoAgora } from '../../estado/audio';
import { useProgresso } from '../../estado/progresso';
import { formatarNota, posicoesDe, type ClasseNota } from '../../teoria/notas';
import css from './Explorar.module.css';

export function Explorar() {
  const { ajustes } = useProgresso();
  const [nota, setNota] = useState<ClasseNota>('C');
  const [bpm, setBpm] = useState(80);
  const [contagem, setContagem] = useState(true);
  const tocandoAgora = useTocandoAgora();

  const marcadores = useMemo<(Marcador & { midi: number })[]>(
    () => posicoesDe(nota).map((p) => ({ ...p, papel: 'fundamental', nota })),
    [nota],
  );

  const tocar = () => {
    const ordem = marcadores
      .map((m, indice) => ({ m, indice }))
      .sort((a, b) => a.m.midi - b.m.midi);
    audio.tocarSequencia(
      ordem.map(({ m, indice }) => ({ midi: m.midi, indice })),
      { bpm, contagem },
    );
  };

  const nome = formatarNota(nota, ajustes.nomesNotas);

  return (
    <div className={css.tela}>
      <div className={css.cabecalho}>
        <h1>Explorar</h1>
        <p className="mudo">Todas as notas {nome}, da casa 0 à 15.</p>
      </div>
      <SeletorTom
        valor={nota}
        aoMudar={(n) => {
          audio.parar();
          setNota(n);
        }}
        rotulo="Nota"
      />
      <div className={css.areaBraco}>
        <Braco
          marcadores={marcadores}
          rotulo="nota"
          tocandoAgora={tocandoAgora >= 0 ? tocandoAgora : null}
          aoTocarMarcador={(i) => {
            const m = marcadores[i];
            if (m) void audio.iniciar().then(() => audio.tocarNota(m.midi));
          }}
          descricao={`Todas as notas ${nome} no braço`}
        />
      </div>
      <BarraReproducao
        bpm={bpm}
        aoMudarBpm={setBpm}
        aoTocar={tocar}
        contagem={contagem}
        aoMudarContagem={setContagem}
        compacta
      />
    </div>
  );
}
