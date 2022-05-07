import { Router } from 'express';
import * as p from '../permis';
import * as idp from './idp';
import * as oauth2 from './oauth2';

export function makeRoutes(permis: p.PermisService, _router: Router) {

  _router.use('/idp',    idp.makeRoutes(permis, Router())._router);
  _router.use('/oauth2', oauth2.makeRoutes(permis, Router())._router);

  return { _router };
}
