import { Request, Response, Router } from 'express';
import { sendError } from '../../errors';
import * as p from '../../permis';
import { IFactory } from '../../types';

export function makeRoutes(f: IFactory, _router: Router) {

  async function create(req: Request, res: Response) {
    try {
      const formData = Object.assign({}, req.query) as Partial<p.oauth2.IRequestToCreateToken>;
      const result = await f.permis.createToken(formData);
      if (result.success) {
        res.json(result.success);
      } else if (result.error) {
        res.json(result.error); // TODO: status
      }

    } catch (err) {

      console.warn(err);
      sendError(req, res, err);
    }
  }

  _router.post('/', create);

  return { _router, create };
}
