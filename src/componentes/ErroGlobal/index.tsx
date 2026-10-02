import { Component, type ReactNode } from 'react';
import { registrarErro } from '../../progresso/erros';

interface Estado {
  erro: Error | null;
}

export class ErroGlobal extends Component<{ children: ReactNode }, Estado> {
  state: Estado = { erro: null };

  static getDerivedStateFromError(erro: Error): Estado {
    return { erro };
  }

  componentDidCatch(erro: Error) {
    registrarErro(erro);
  }

  render() {
    if (!this.state.erro) return this.props.children;
    return (
      <main
        role="alert"
        style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}
      >
        <h1>Algo deu errado</h1>
        <p className="mudo">
          O erro foi registrado em Ajustes. Seu progresso está salvo neste aparelho.
        </p>
        <button className="btn btn-primario" onClick={() => window.location.reload()}>
          Recarregar
        </button>
      </main>
    );
  }
}
