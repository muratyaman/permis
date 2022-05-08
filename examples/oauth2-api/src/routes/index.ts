import { Router } from 'express';
import { IFactory } from '../types';
import * as idp from './idp';
import * as oauth2 from './oauth2';

export function makeRoutes(f: IFactory, _router: Router) {

  _router.use('/idp',    idp.makeRoutes(f, Router())._router);
  _router.use('/oauth2', oauth2.makeRoutes(f, Router())._router);

  return { _router };
}
