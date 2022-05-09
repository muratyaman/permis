import { Request, Response, Router } from 'express';
import { readFileSync } from 'fs';
import { compile } from 'handlebars';
import { resolve } from 'path';
import { sendError } from '../../errors';
import * as p from '../../permis';
import { IFactory } from '../../types';

export function makeRoutes(f: IFactory, _router: Router) {

  const authLandingPagePath     = resolve(__dirname, '..', '..', '..', 'static', 'oauth2', 'authorize', 'index.html.hbs');
  const authLandingPage         = readFileSync(authLandingPagePath).toString('utf-8');
  const authLandingPageCompiled = compile(authLandingPage);

  async function startAuthorization(req: Request, res: Response) {
    try {
      p.objectPropAsString(req.query, '')
      const formData = Object.assign({}, req.query);
      
      const result = await f.permis.authorizeStart({
        response_type: p.objectPropAsString(formData, 'response_type', 'code') as p.oauth2.ResponseType,
        client_id:     p.objectPropAsString(formData, 'client_id', ''),
        redirect_uri:  p.objectPropAsString(formData, 'redirect_uri', ''),
        scope:         p.objectPropAsString(formData, 'scope', ''),
        state:         p.objectPropAsString(formData, 'state', ''),
      });
      const uri = result.redirect_uri ? result.redirect_uri.toString() : '';

      console.debug({ uri });

      if (result.success) {
        console.info(result.success);
        if ('consent_id' in result.success) {
          console.debug('step to START consent user journey...');
          // next: redirect to IdP app, user should authenticate + update consent allow/deny
          if (f.permis.conf.options.selfHosted) {
            // PREPARE context for template
            const scopes   = result.request.scope.split(' ');
            const client   = await f.permis.conf.clientService.retrieve(result.request.client_id);
            const app_name = client.name ?? 'Application';
            const { consent_id } = result.success;
            const $ctx = { app_name, scopes, consent_id };

            const html = authLandingPageCompiled({ $ctx });
            return res.send(html);
          }
        }
      } else {
        console.warn(result.error);
      }

      if (uri) res.redirect(uri);
      else res.json(result.error ?? { error: 'failed' }); // TODO: status

    } catch (err) {

      sendError(req, res, err);
    }
  }

  async function finishAuthorization(req: Request, res: Response) {
    try {
      const formData = Object.assign({}, req.body) as Partial<p.oauth2.IRequestToAuthorize>;
      const result = await f.permis.authorize(formData);
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

      sendError(req, res, err);
    }
  }

  _router.get('/',  startAuthorization);
  _router.post('/', finishAuthorization);

  return { _router, startAuthorization, finishAuthorization };
}
