import { Router } from 'express';
import * as p from '../../permis';
import * as tokens from './tokens';

export function makeRoutes(permis: p.PermisService, _router: Router) {

  _router.use('/tokens', tokens.makeRoutes(permis, Router())._router);

  return { _router, tokens };
}
