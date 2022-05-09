import { Router } from 'express';
import { IFactory } from '../../types';
import * as tokens from './tokens';
import * as users from './users';

export function makeRoutes(f: IFactory, _router: Router) {

  _router.use('/tokens', tokens.makeRoutes(f, Router())._router);
  _router.use('/users',  users.makeRoutes(f, Router())._router);

  return { _router, tokens, users };
}
