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

/** Lição avulsa (rota /licao/:modulo/:licao). */
export function Licao() {
  const params = useParams<{ modulo: string; licao: string }>();
  const [, navegar] = useLocation();
  const voltar = () => navegar('/trilha');
  return (
    <LicaoConteudo
      moduloId={params.modulo}
      licaoId={params.licao}
      aoConcluir={voltar}
      aoSair={voltar}
    />
  );
}

interface PropsLicao {
  moduloId: string;
  licaoId: string;
  aoConcluir: () => void;
  aoSair: () => void;
  /** "3 de 8" quando dentro da Sessão do dia. */
  posicao?: string;
}

/** Telas de conceito de uma lição; marca a lição como vista ao concluir. */
export function LicaoConteudo({ moduloId, licaoId, aoConcluir, aoSair, posicao }: PropsLicao) {
  const { ajustes, atualizar } = useProgresso();
  const tocandoAgora = useTocandoAgora();
  const modulo = buscarModulo(moduloId);
  const licao = buscarLicao(moduloId, licaoId);
  const [pagina, setPagina] = useState(0);
  const [rotulo, setRotulo] = useState<'grau' | 'nota'>('grau');

  const tela = licao?.telas[pagina];
  const dados = useMemo(() => (tela?.exemplo ? exemploMusical(tela.exemplo) : null), [tela]);
  const [passoSel, setPassoSel] = useState(0);
  // Exemplos com vários acordes: o braço mostra o acorde que soa (ou o escolhido).
  const passos = dados?.passos;
  const indicePasso = passos ? (tocandoAgora >= 0 ? tocandoAgora : passoSel) : 0;
  const passo = passos?.[indicePasso];

  if (!modulo || !licao || !tela) {
    return (
      <main className={css.tela}>
        <h1>Lição não encontrada</h1>
        <button className="btn" onClick={aoSair}>
          Voltar
        </button>
      </main>
    );
  }

  const ultima = pagina === licao.telas.length - 1;
  const irPara = (p: number) => {
    audio.parar();
    setPassoSel(0);
    setPagina(p);
  };
  const sair = () => {
    audio.parar();
    aoSair();
  };
  const concluir = () => {
    audio.parar();
    atualizar((p) => ({
      ...p,
      licoesVistas: {
        ...(p.licoesVistas ?? {}),
        [`${moduloId}/${licaoId}`]: new Date().toISOString(),
      },
    }));
    aoConcluir();
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
          {posicao ? `${posicao} · ` : ''}
          {pagina + 1}/{licao.telas.length}
        </span>
      </header>

      <p className={css.texto}>{formatarTexto(tela.texto, ajustes.nomesNotas)}</p>

      {dados && (
        <div className={css.exemplo}>
          <div className={css.cabecalhoExemplo}>
            <span className={css.cifra}>{formatarTexto(dados.titulo, ajustes.nomesNotas)}</span>
            {passos && (
              <div className={css.acordes} role="group" aria-label="Acordes">
                {passos.map((p, i) => (
                  <button
                    key={p.grau + i}
                    className={css.acorde}
                    aria-pressed={i === indicePasso}
                    onClick={() => {
                      setPassoSel(i);
                      void audio.iniciar().then(() => audio.tocarNota(p.midi, 1.5));
                    }}
                  >
                    <strong>{p.cifra}</strong>
                    <span>{p.grau}</span>
                  </button>
                ))}
              </div>
            )}
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
              marcadores={passo?.marcadores ?? dados.marcadores}
              {...(passo
                ? {
                    faixa: [Math.max(0, passo.faixa[0] - 1), passo.faixa[0] + 4] as [
                      number,
                      number,
                    ],
                  }
                : dados.faixa
                  ? { faixa: dados.faixa }
                  : {})}
              {...(dados.sombra ? { sombra: dados.sombra } : {})}
              rotulo={rotulo}
              tocandoAgora={!passos && tocandoAgora >= 0 ? tocandoAgora : null}
              aoTocarMarcador={(i) => {
                const m = (passo?.marcadores ?? dados.marcadores)[i];
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
        <button
          className="btn btn-primario"
          onClick={() => (ultima ? concluir() : irPara(pagina + 1))}
        >
          {ultima ? 'Concluir' : 'Próxima'}
        </button>
      </footer>
    </main>
  );
}
