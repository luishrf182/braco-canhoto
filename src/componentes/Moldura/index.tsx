import type { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import css from './Moldura.module.css';

const ITENS = [
  {
    href: '/hoje',
    rotulo: 'Hoje',
    icone:
      'M12 3v2M12 19v2M3 12h2M19 12h2M6 6l1.5 1.5M16.5 16.5L18 18M6 18l1.5-1.5M16.5 7.5L18 6M12 8a4 4 0 100 8 4 4 0 000-8z',
  },
  {
    href: '/trilha',
    rotulo: 'Trilha',
    icone: 'M5 19c4 0 3-6 7-6s3-6 7-6M5 19a1.5 1.5 0 100 .01M19 7a1.5 1.5 0 100 .01',
  },
  { href: '/explorar', rotulo: 'Explorar', icone: 'M3 8h18M3 12h18M3 16h18M8 5v14M16 5v14' },
  { href: '/ajustes', rotulo: 'Ajustes', icone: 'M4 7h10M18 7h2M4 17h4M12 17h8M14 5v4M8 15v4' },
];

/** Moldura das telas de navegação: barra inferior em retrato, trilho lateral em paisagem. */
export function Moldura({ children }: { children: ReactNode }) {
  const [local] = useLocation();
  return (
    <div className={css.moldura}>
      <nav className={css.nav} aria-label="Principal">
        {ITENS.map((i) => {
          const ativo = local.startsWith(i.href);
          return (
            <Link
              key={i.href}
              href={i.href}
              className={css.item}
              aria-current={ativo ? 'page' : undefined}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className={css.icone}>
                <path d={i.icone} />
              </svg>
              <span>{i.rotulo}</span>
            </Link>
          );
        })}
      </nav>
      <main className={css.principal}>{children}</main>
    </div>
  );
}
