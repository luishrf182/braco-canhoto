import { useEffect } from 'react';
import { Router } from 'wouter';
import { useHashLocation } from 'wouter/use-hash-location';
import { ProvedorProgresso, useProgresso } from './estado/progresso';
import { ErroGlobal } from './componentes/ErroGlobal';
import { Rotas } from './rotas';

function useTema() {
  const { ajustes } = useProgresso();
  useEffect(() => {
    const midia = window.matchMedia('(prefers-color-scheme: dark)');
    const aplicar = () => {
      const escuro = ajustes.tema === 'escuro' || (ajustes.tema === 'sistema' && midia.matches);
      document.documentElement.dataset.theme = escuro ? 'dark' : 'light';
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', escuro ? '#121212' : '#FAFAF7');
    };
    aplicar();
    midia.addEventListener('change', aplicar);
    return () => midia.removeEventListener('change', aplicar);
  }, [ajustes.tema]);
}

function Conteudo() {
  useTema();
  return (
    <Router hook={useHashLocation}>
      <Rotas />
    </Router>
  );
}

export function App() {
  return (
    <ErroGlobal>
      <ProvedorProgresso>
        <Conteudo />
      </ProvedorProgresso>
    </ErroGlobal>
  );
}
