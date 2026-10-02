import type { ReactNode } from 'react';
import { Redirect, Route, Switch, useLocation } from 'wouter';
import { Moldura } from './componentes/Moldura';
import { useProgresso } from './estado/progresso';
import { Hoje } from './telas/Hoje';
import { Ajustes } from './telas/Ajustes';
import { Calibracao } from './telas/Calibracao';
import { Explorar } from './telas/Explorar';
import { Diagnostico } from './telas/Diagnostico';
import { Exercicio } from './telas/Exercicio';
import { Licao } from './telas/Licao';
import { Resultado } from './telas/Resultado';
import { Sessao } from './telas/Sessao';
import { Trilha } from './telas/Trilha';

function ExigeCalibracao({ children }: { children: ReactNode }) {
  const { ajustes } = useProgresso();
  const [local] = useLocation();
  if (!ajustes.calibrado && local !== '/calibracao') return <Redirect to="/calibracao" replace />;
  return <>{children}</>;
}

export function Rotas() {
  return (
    <ExigeCalibracao>
      <Switch>
        <Route path="/calibracao">
          <Calibracao />
        </Route>
        <Route path="/exercicio/:modelo/:tom?/:forma?">
          <Exercicio />
        </Route>
        <Route path="/licao/:modulo/:licao">
          <Licao />
        </Route>
        <Route path="/diagnostico">
          <Diagnostico />
        </Route>
        <Route path="/sessao">
          <Sessao />
        </Route>
        <Route path="/resultado">
          <Resultado />
        </Route>
        <Route path="/hoje">
          <Moldura>
            <Hoje />
          </Moldura>
        </Route>
        <Route path="/trilha">
          <Moldura>
            <Trilha />
          </Moldura>
        </Route>
        <Route path="/explorar">
          <Moldura>
            <Explorar />
          </Moldura>
        </Route>
        <Route path="/ajustes">
          <Moldura>
            <Ajustes />
          </Moldura>
        </Route>
        <Route>
          <Redirect to="/hoje" replace />
        </Route>
      </Switch>
    </ExigeCalibracao>
  );
}
