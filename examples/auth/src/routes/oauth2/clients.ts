import { Request, Response, Router } from 'express';
import { sendError } from '../../errors';
import { IClientDtoToWrite } from '../../permis';
import { IFactory } from '../../types';

export function makeRoutes(f: IFactory, _router: Router) {

  const service = f.permis.conf.clientService;

  async function create(req: Request, res: Response) {
    try {
      const input = req.body as IClientDtoToWrite; // TODO: validate
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

      sendError(req, res, err);
    }
  }

  _router.post('/',   create);
  _router.get('/:id', retrieve);

  return { _router, create, retrieve };
}
