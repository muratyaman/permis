import { Router } from 'express';
import * as authorize from './authorize';
import * as authenticate from './authenticate';
import * as clients from './clients';
import * as consents from './consents';
import * as consumers from './consumers';
import * as tokens from './tokens';
import { IFactory } from '../../types';

export function makeRoutes(f: IFactory, _router: Router) {

  _router.use('/authorize',    authorize.makeRoutes   (f, Router())._router);
  _router.use('/authenticate', authenticate.makeRoutes(f, Router())._router);
  _router.use('/clients',      clients.makeRoutes     (f, Router())._router);
  _router.use('/consents',     consents.makeRoutes    (f, Router())._router);
  _router.use('/consumers',    consumers.makeRoutes   (f, Router())._router);
  _router.use('/tokens',       tokens.makeRoutes      (f, Router())._router);

  return { _router, authorize, authenticate, clients, consents, consumers, tokens };
}
