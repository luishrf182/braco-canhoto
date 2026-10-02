import { useEffect, useState } from 'react';

const CONSULTA = '(orientation: portrait) and (max-width: 699px)';

/** Retrato estreito (celular em pé): o braço mostra uma janela de casas. */
export function useCompacto(): boolean {
  const [compacto, setCompacto] = useState(() => window.matchMedia(CONSULTA).matches);
  useEffect(() => {
    const m = window.matchMedia(CONSULTA);
    const aoMudar = () => setCompacto(m.matches);
    m.addEventListener('change', aoMudar);
    return () => m.removeEventListener('change', aoMudar);
  }, []);
  return compacto;
}
