import { useMemo, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import * as audio from '../../audio/motor';
import { Braco } from '../../componentes/Braco';
import { buscarLicao, buscarModulo } from '../../conteudo';
import { useTocandoAgora } from '../../estado/audio';
import { useProgresso } from '../../estado/progresso';
import { formatarTexto } from '../../teoria/notas';
import { exemploMusical } from './exemplo';
import css from './Licao.module.css';

export function Licao() {
  const params = useParams<{ modulo: string; licao: string }>();
  const [, navegar] = useLocation();
  const { ajustes } = useProgresso();
  const tocandoAgora = useTocandoAgora();
  const modulo = buscarModulo(params.modulo);
  const licao = buscarLicao(params.modulo, params.licao);
  const [pagina, setPagina] = useState(0);
  const [rotulo, setRotulo] = useState<'grau' | 'nota'>('grau');

  const tela = licao?.telas[pagina];
  const dados = useMemo(() => (tela?.exemplo ? exemploMusical(tela.exemplo) : null), [tela]);

  if (!modulo || !licao || !tela) {
    return (
      <main className={css.tela}>
        <h1>Lição não encontrada</h1>
        <button className="btn" onClick={() => navegar('/trilha')}>
          Voltar à trilha
        </button>
      </main>
    );
  }

  const ultima = pagina === licao.telas.length - 1;
  const irPara = (p: number) => {
    audio.parar();
    setPagina(p);
  };
  const sair = () => {
    audio.parar();
    navegar('/trilha');
  };
  const ouvir = async () => {
    if (!dados) return;
    await audio.iniciar();
    audio.tocarSequencia(dados.eventos, { bpm: 90, contagem: false });
  };

  return (
    <main className={css.tela}>
      <header className={css.topo}>
        <button className="btn btn-fantasma" aria-label="Sair da lição" onClick={sair}>
          <svg viewBox="0 0 24 24" aria-hidden="true" className={css.icone}>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <span className={css.titulo}>
          {modulo.titulo} · {licao.titulo}
        </span>
        <span className="rotulo num">
          {pagina + 1}/{licao.telas.length}
        </span>
      </header>

      <p className={css.texto}>{formatarTexto(tela.texto, ajustes.nomesNotas)}</p>

      {dados && (
        <div className={css.exemplo}>
          <div className={css.cabecalhoExemplo}>
            <span className={css.cifra}>{dados.titulo}</span>
            {dados.chips.length > 0 && (
              <ul className={css.chips} aria-label="Notas do acorde">
                {dados.chips.map((c) => (
                  <li key={c.grau + c.nota} className={css.chip} data-papel={c.papel}>
                    <strong>{formatarTexto(`{n:${c.nota}}`, ajustes.nomesNotas)}</strong>
                    <span>{c.grau}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className={css.braco}>
            <Braco
              marcadores={dados.marcadores}
              {...(dados.faixa ? { faixa: dados.faixa } : {})}
              {...(dados.sombra ? { sombra: dados.sombra } : {})}
              rotulo={rotulo}
              tocandoAgora={tocandoAgora >= 0 ? tocandoAgora : null}
              aoTocarMarcador={(i) => {
                const m = dados.marcadores[i];
                if (m?.midi !== undefined)
                  void audio.iniciar().then(() => audio.tocarNota(m.midi!));
              }}
              descricao={dados.titulo}
            />
          </div>
        </div>
      )}

      <footer className={css.rodape}>
        <button className="btn" disabled={pagina === 0} onClick={() => irPara(pagina - 1)}>
          Anterior
        </button>
        {dados && (
          <div className={css.meio}>
            <button className="btn" onClick={() => void ouvir()} aria-label="Ouvir o exemplo">
              <span aria-hidden="true">▶</span> Ouvir
            </button>
            <button
              className="btn"
              onClick={() => setRotulo(rotulo === 'grau' ? 'nota' : 'grau')}
              aria-label={rotulo === 'grau' ? 'Mostrar notas' : 'Mostrar graus'}
            >
              {rotulo === 'grau' ? 'Graus' : 'Notas'}
            </button>
          </div>
        )}
        <button className="btn btn-primario" onClick={() => (ultima ? sair() : irPara(pagina + 1))}>
          {ultima ? 'Concluir' : 'Próxima'}
        </button>
      </footer>
    </main>
  );
}
