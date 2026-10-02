import { Redirect, Route, Switch } from 'wouter';
import { Moldura } from './componentes/Moldura';
import { Hoje } from './telas/Hoje';
import { Ajustes } from './telas/Ajustes';
import { EmBreve } from './telas/EmBreve';

export function Rotas() {
  return (
    <Switch>
      <Route path="/hoje">
        <Moldura>
          <Hoje />
        </Moldura>
      </Route>
      <Route path="/trilha">
        <Moldura>
          <EmBreve titulo="Trilha" />
        </Moldura>
      </Route>
      <Route path="/explorar">
        <Moldura>
          <EmBreve titulo="Explorar" />
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
  );
}
