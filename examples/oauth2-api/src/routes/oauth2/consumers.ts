import { Request, Response, Router } from 'express';
import { IFactory } from '../../types';

export function makeRoutes(f: IFactory, _router: Router) {

  async function getConsumer(req: Request, res: Response) {
    try {
      const { id = '' } = req.params;
      const data = await f.permis.conf.consumerService.retrieve(id);
      res.json({ data });

    } catch (err) {

      console.warn(err);
      res.json({ error: 'Failed to get consumer details' }); // TODO: status
    }
  }

  _router.get('/:id', getConsumer);

  return { _router, getConsumer };
}
