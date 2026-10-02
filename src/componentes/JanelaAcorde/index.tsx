import { Braco, type PropsBraco } from '../Braco';

/**
 * O mesmo Braço, limitado a 4–5 casas: substitui o diagrama vertical de acorde,
 * que não existe neste app (ADR-8).
 */
export function JanelaAcorde(props: Omit<PropsBraco, 'faixa'> & { faixa: [number, number] }) {
  return <Braco {...props} />;
}
