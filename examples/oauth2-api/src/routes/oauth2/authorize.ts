import { Request, Response, Router } from 'express';
import { readFileSync } from 'fs';
import { compile } from 'handlebars';
import { resolve } from 'path';
import * as p from '../../permis';

export function makeRoutes(permis: p.PermisService, _router: Router) {

  const authLandingPagePath     = resolve(__dirname, '..', '..', '..', 'static', 'oauth2', 'authorize', 'index.html.hbs');
  const authLandingPage         = readFileSync(authLandingPagePath).toString('utf-8');
  const authLandingPageCompiled = compile(authLandingPage);

  async function startAuthorization(req: Request, res: Response) {
    try {
      const formData = Object.assign({}, req.query) as Partial<p.oauth2.IRequestToAuthorize>;
      const result = await permis.authorize(formData);
      const uri = result.redirect_uri ? result.redirect_uri.toString() : '';

      console.debug({ uri });

      if (result.success) {
        console.info(result.success);
        if ('consent_id' in result.success) {
          console.debug('step to START consent user journey...');
          // next: redirect to IdP app, user should authenticate + update consent allow/deny

          // PREPARE context for template
          const scopes = result.request.scope.split(' ');
          const client = await permis.conf.clientService.find(result.request.client_id);
          const app_name = client.name ?? 'Application';
          const { consent_id } = result.success;

          const html = authLandingPageCompiled({ app_name, scopes, consent_id });
          return res.send(html);
        }
      } else {
        console.warn(result.error);
      }

      if (uri) res.redirect(uri);
      else res.json(result.error ?? { error: 'failed' }); // TODO: status

    } catch (err) {

      res.status(500).json({ error: err instanceof Error ? err.message : 'Server error' });
    }
  }

  async function finishAuthorization(req: Request, res: Response) {
    try {
      const formData = Object.assign({}, req.body) as Partial<p.oauth2.IRequestToAuthorize>;
      const result = await permis.authorize(formData);
      const uri = result.redirect_uri ? result.redirect_uri.toString() : '';

      console.debug({ uri });

      if (result.success) {
        console.info(result.success);
        if ('code' in result.success) {
          console.debug('step to FINISH consent user journey...');
          // next: redirect to Client app, it should use auth code to get access token
        }
      } else {
        console.warn(result.error);
      }

      if (uri) res.redirect(uri);
      else res.json(result.error ?? { error: 'failed' }); // TODO: status

    } catch (err) {

      res.status(500).json({ error: err instanceof Error ? err.message : 'Server error' });
    }
  }

  _router.get('/',  startAuthorization);
  _router.post('/', finishAuthorization);

  return { _router, startAuthorization, finishAuthorization };
}
