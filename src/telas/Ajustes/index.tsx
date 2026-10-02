import { useState } from 'react';
import { useProgresso } from '../../estado/progresso';
import { lerErros, limparErros } from '../../progresso/erros';
import { apagarTudoLocal } from '../../progresso/local';
import type { Ajustes as TAjustes } from '../../tipos';
import css from './Ajustes.module.css';

interface Opcao<T> {
  valor: T;
  rotulo: string;
}

function Grupo<T extends string | number | boolean>({
  titulo,
  valor,
  opcoes,
  aoMudar,
}: {
  titulo: string;
  valor: T;
  opcoes: Opcao<T>[];
  aoMudar: (v: T) => void;
}) {
  return (
    <div className={css.grupo} role="group" aria-label={titulo}>
      <span className="rotulo">{titulo}</span>
      <div className="linha">
        {opcoes.map((o) => (
          <button
            key={String(o.valor)}
            className="btn"
            aria-pressed={valor === o.valor}
            onClick={() => aoMudar(o.valor)}
          >
            {o.rotulo}
          </button>
        ))}
      </div>
    </div>
  );
}

const ATALHOS = [
  ['Espaço', 'tocar / pausar'],
  ['← →', 'BPM − / +'],
  ['Enter', 'próximo'],
  ['1 · 2 · 3', 'Limpo · Quase · Travou'],
];

export function Ajustes() {
  const { ajustes, atualizarAjustes } = useProgresso();
  const [erros, setErros] = useState(() => lerErros());

  return (
    <div className={css.tela}>
      <h1>Ajustes</h1>

      <section className="pilha" aria-labelledby="aj-aparencia">
        <h2 id="aj-aparencia">Aparência</h2>
        <Grupo<TAjustes['tema']>
          titulo="Tema"
          valor={ajustes.tema}
          opcoes={[
            { valor: 'claro', rotulo: 'Claro' },
            { valor: 'escuro', rotulo: 'Escuro' },
            { valor: 'sistema', rotulo: 'Sistema' },
          ]}
          aoMudar={(tema) => atualizarAjustes({ tema })}
        />
      </section>

      <section className="pilha" aria-labelledby="aj-atalhos">
        <h2 id="aj-atalhos">Atalhos de teclado</h2>
        <p className="mudo">Funcionam também com pedal Bluetooth.</p>
        <dl className={css.atalhos}>
          {ATALHOS.map(([tecla, acao]) => (
            <div key={tecla}>
              <dt>
                <kbd>{tecla}</kbd>
              </dt>
              <dd>{acao}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="pilha" aria-labelledby="aj-dados">
        <h2 id="aj-dados">Dados</h2>
        <p className="mudo">
          Seu progresso fica neste aparelho. Apagar aqui não apaga a cópia no Gist: para isso, abra
          gist.github.com e exclua “braco-canhoto-progresso.json”.
        </p>
        <div>
          <button
            className="btn"
            onClick={() => {
              if (window.confirm('Apagar todo o progresso salvo neste aparelho?')) {
                apagarTudoLocal();
                window.location.reload();
              }
            }}
          >
            Apagar dados deste aparelho
          </button>
        </div>
      </section>

      <section className="pilha" aria-labelledby="aj-sobre">
        <h2 id="aj-sobre">Sobre</h2>
        <p>
          Versão <code className="num">{__VERSAO__}</code>
        </p>
        <details>
          <summary>Últimos erros ({erros.length})</summary>
          {erros.length === 0 ? (
            <p className="mudo">Nenhum erro registrado.</p>
          ) : (
            <>
              <ol className={css.erros}>
                {erros.map((e) => (
                  <li key={e.em + e.mensagem}>
                    <span className="rotulo num">{new Date(e.em).toLocaleString('pt-BR')}</span>
                    <br />
                    {e.mensagem}
                  </li>
                ))}
              </ol>
              <button
                className="btn"
                onClick={() => {
                  limparErros();
                  setErros([]);
                }}
              >
                Limpar log
              </button>
            </>
          )}
        </details>
      </section>
    </div>
  );
}
