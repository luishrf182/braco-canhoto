import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './estilo/tokens.css';
import './estilo/base.css';
import { App } from './App';
import { registrarErro } from './progresso/erros';

window.addEventListener('error', (e) => registrarErro(e.error ?? e.message));
window.addEventListener('unhandledrejection', (e) => registrarErro(e.reason));

const raiz = document.getElementById('root');
if (!raiz) throw new Error('#root não encontrado');

createRoot(raiz).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
