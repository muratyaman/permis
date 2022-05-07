import { Router } from 'express';
import * as p from '../../permis';
import * as authorize from './authorize';
import * as authenticate from './authenticate';
import * as clients from './clients';
import * as consents from './consents';
import * as consumers from './consumers';
import * as tokens from './tokens';

export function makeRoutes(permis: p.PermisService, _router: Router) {

  _router.use('/authorize',    authorize.makeRoutes   (permis, Router())._router);
  _router.use('/authenticate', authenticate.makeRoutes(permis, Router())._router);
  _router.use('/clients',      clients.makeRoutes     (permis, Router())._router);
  _router.use('/consents',     consents.makeRoutes    (permis, Router())._router);
  _router.use('/consumers',    consumers.makeRoutes   (permis, Router())._router);
  _router.use('/tokens',       tokens.makeRoutes      (permis, Router())._router);

  return { _router, authorize, authenticate, clients, consents, consumers, tokens };
}
