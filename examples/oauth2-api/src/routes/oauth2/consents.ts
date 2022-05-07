import { Request, Response, Router } from 'express';
import * as p from '../../permis';

export function makeRoutes(permis: p.PermisService, _router: Router) {

  async function getConsent(req: Request, res: Response) {
    try {
      const { id = '' } = req.params;
      const consent  = await permis.conf.consentService.retrieve(id);
      const client   = await permis.conf.clientService.retrieve(consent.client_id);
      const consumer = await permis.conf.consumerService.retrieve(client.consumer_id);
      const data = {
        consumer: { name: consumer.name },
        client:   { name: client.name },
        scopes:   consent.scope.split(' ').map(code => ({ code, description: code.replace(':', ' ') })),
      };
      res.json({ data });
    } catch (err) {
      res.json({ error: 'Failed to get consent details' });
    }
  }

  async function updateConsent(req: Request, res: Response) {
    try {
      let token = '', token_type = 'bearer';
      const headerToken = req.get('Authorization');
      if (!headerToken) return res.status(401).json({ error: 'Unauthorized' });

      const parts = headerToken.split(' ');// 'Bearer TOKEN'
      if (!parts || !parts.length) return res.status(401).json({ error: 'Unauthorized' });

      token_type  = parts[0];
      token       = parts[1];
      const userResult = await permis.authenticate({ token }); // TODO: include token type?
      const { user_id = '' } = userResult.success ?? {};
      if (!userResult.success || user_id) return res.status(401).json({ error: 'Unauthorized' });

      const { id = '' } = req.params;
      let { is_granted = 0, client_id = '', redirect_uri = '', scope = '', state = '' } = req.body;

      const found = await permis.conf.consentService.retrieve(id); // throws error
      if (found.client_id !== client_id) {
        console.debug('client_id mismatch');
        return res.status(400).json({ error: 'Bad request' });
      }
      if (found.redirect_uri !== redirect_uri) {
        console.debug('redirect_uri mismatch');
        return res.status(400).json({ error: 'Bad request' });
      }
      if (found.scope !== scope) {
        console.debug('scope mismatch');
        return res.status(400).json({ error: 'Bad request' });
      }
      if (found.state !== state) {
        console.debug('state mismatch');
        return res.status(400).json({ error: 'Bad request' });
      }
      if (found.user_id) {
        console.debug('user_id already entered');
        return res.status(400).json({ error: 'Bad request' });
      }
      if (![0, 1].includes(is_granted)) {
        console.debug('is_granted is invalid');
        return res.status(400).json({ error: 'Bad request' });
      }
      // TODO: expires_at a future date
      const change = { user_id: String(user_id), is_granted: !!is_granted ? 1 : 0 };
      const data = await permis.conf.consentService.update(id, change);
      res.json({ data });

    } catch (err) {

      res.json({ error: err instanceof Error ? err.message : 'Failed to update consent' }); // TODO: status
    }
  }

  _router.get  ('/:id', getConsent);
  _router.patch('/:id', updateConsent);

  return { _router, getConsent, updateConsent };
}
