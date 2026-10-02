import { useEffect, useState } from 'react';
import { aoMudarEstado, aoTocar, estadoAtual, type EstadoAudio } from '../audio/motor';

export function useEstadoAudio(): EstadoAudio {
  const [estado, setEstado] = useState<EstadoAudio>(() => estadoAtual());
  useEffect(() => aoMudarEstado(setEstado), []);
  return estado;
}

/** Índice do evento que está soando (−1 parado; ≤ −2 durante a contagem: −2 = tempo 1). */
export function useTocandoAgora(): number {
  const [indice, setIndice] = useState(-1);
  useEffect(() => aoTocar(setIndice), []);
  return indice;
}

export function ehIos(): boolean {
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1);
}
