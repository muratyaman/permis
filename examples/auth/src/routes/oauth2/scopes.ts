import { Request, Response, Router } from 'express';
import { sendError } from '../../errors';
import { IScopeDtoToWrite } from '../../permis';
import { IFactory } from '../../types';

export function makeRoutes(f: IFactory, _router: Router) {

  const service = f.permis.conf.scopeService;

  async function create(req: Request, res: Response) {
    try {
      const input = req.body as IScopeDtoToWrite; // TODO: validate
      const data = await service.create(input);
      res.json({ data });

    } catch (err) {

      sendError(req, res, err);
    }
  }

  async function retrieve(req: Request, res: Response) {
    try {
      const { id = '' } = req.params;
      const data = await service.retrieve(id);
      res.json({ data });

    } catch (err) {

      console.warn(err);
      sendError(req, res, err);
    }
  }

  async function search(req: Request, res: Response) {
    try {
      const data = await service.findMany({});
      res.json({ data });

    } catch (err) {

      console.warn(err);
      sendError(req, res, err);
    }
  }

  _router.post('/',    create);
  _router.get ('/:id', retrieve);
  _router.get ('/',    search);

  return { _router, create, retrieve, search };
}
