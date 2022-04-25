import * as C from './constants';
import { PermisError } from './errors';
import * as oauth2 from './oauth2';
import { ITokenDto } from './services';
import { IPermisConfiguration, IPermisService } from './types';
import { expiresAtStr, hasExpired } from './utils';

/**
 * Consumer/App POSTs + redirects to 1
 * 1. authorize (start)         => redirect to IdP/App
 * 2. authenticate + consent    => redirect to 3 us
 * 3. authorize (finish + code) => redirect to Consumer/App
 * Consumer/App calls 4 and later 5 when access token expires before refresh token expires
 * 4. token (all client info + auth code) => access token + refresh token
 * 5. token (client info + refresh token) => access token + refresh token
 */
export class PermisService implements IPermisService {

  constructor(public conf: IPermisConfiguration) {}

  authorize(req: oauth2.IRequestToAuthorize): Promise<oauth2.IResponseToAuthorize> {
    if (oauth2.isRequestToStartAuthorization(req))
      return this._authorizeStart(req);
    return this._authorizeFinish(req);
  }

  async _authorizeStart(request: oauth2.IRequestToStartAuthorization): Promise<oauth2.IResponseToStartAuthorization> {
    const response: oauth2.IResponseToStartAuthorization = {
      request,
      redirect_uri: new URL(this.conf.options.idpAppUrl),
    };
    try {

      // prepare redirect URI for IdP App to authenticate and give consent
      response.redirect_uri.searchParams.append('client_id', request.client_id);
      response.redirect_uri.searchParams.append('redirect_uri', request.redirect_uri);
      response.redirect_uri.searchParams.append('scope', request.scope);
      if (request.state) response.redirect_uri.searchParams.append('state', request.state);
      if (request.nonce) response.redirect_uri.searchParams.append('nonce', request.nonce);

      const client = await this.conf.clientService.find(request.client_id);
      await this.conf.clientService.verifyClientWithRedirectUri(client, request.redirect_uri);
      await this.conf.scopeService.verifyScopes(request.scope.split(' '));

      const consent = await this.conf.consentService.create({
        client_id: client.id,
        redirect_uri: request.redirect_uri,
        scope: request.scope,
        state: request.state,
      })
      response.success = {
        consent_id: consent.id,
      };

    } catch (err) {
      response.error = {
        error: oauth2.ErrorTypeEnum.invalid_request,
        error_description: err instanceof Error ? err.message : undefined,
      };
    }

    return response;
  }

  async authenticate(request: oauth2.IRequestToAuthenticate): Promise<oauth2.IResponseToAuthenticate> {
    const response: oauth2.IResponseToAuthenticate = { request };

    try {
      const user = await this.conf.identityService.authenticate({ token: request.token });

      const accessToken = await this.conf.securityService.generateJwt({
        client_id: user.id,
        user_id: user.id,
        scope: 'profile',
      }, C.defaultAccessTokenExpiryInSeconds);

      response.success = {
        user_id: user.id,
        token: accessToken,
      };
    } catch (err) {
      response.error = {
        error: oauth2.ErrorTypeEnum.invalid_request,
        error_description: err instanceof Error ? err.message : undefined,
      };
    }

    return response;
  }

  _isAllowed(allow: string): boolean {
    return allow === 'true';
  }

  async _authorizeFinish(request: oauth2.IRequestToFinishAuthorization): Promise<oauth2.IResponseToFinishAuthorization> {
    const response: oauth2.IResponseToFinishAuthorization = {
      request,
      redirect_uri: new URL(request.redirect_uri),
    };

    // prepare consumer's redirect URI
    if (request.state) response.redirect_uri.searchParams.append('state', request.state);
    if (request.nonce) response.redirect_uri.searchParams.append('nonce', request.nonce);

    try {
      const client = await this.conf.clientService.find(request.client_id);
      await this.conf.clientService.verifyClientWithRedirectUri(client, request.redirect_uri);

      const isAllowed = this._isAllowed(request.allow);

      if (request.consent_id) { // update consent
        const consent = await this.conf.consentService.find(request.consent_id);
        consent.is_granted = isAllowed ? 1 : 0;
        await this.conf.consentService.update(consent.id, consent);
      }

      if (!isAllowed) {
        response.error = {
          error: oauth2.ErrorTypeEnum.access_denied, // TODO: review
        };
        response.redirect_uri.searchParams.append('error', response.error.error);
        return response;
      }

      const authCode = await this.conf.authCodeService.create({
        client_id: client.id,
        expires_at: expiresAtStr(C.defaultAuthCodeExpiryInSeconds),
        scope: request.scope,
      });
      response.success = {
        code: authCode.id,
      };
      response.redirect_uri.searchParams.append('code', response.success.code);

    } catch (err) {
      response.error = {
        error: oauth2.ErrorTypeEnum.invalid_request,
        error_description: err instanceof Error ? err.message : undefined,
      };
      response.redirect_uri.searchParams.append('error', response.error.error);
    }

    return response;
  }

  async token(request: oauth2.IRequestToCreateToken): Promise<oauth2.IResponseToCreateToken> {
    if (oauth2.isRequestToCreateTokenByAuthCode(request))
      return this._tokenByAuthCode(request);
    return this._tokenByCredentials(request);
  }

  async _tokenByAuthCode(request: oauth2.IRequestToCreateTokenByAuthCode): Promise<oauth2.IResponseToCreateTokenByAuthCode> {
    const response: oauth2.IResponseToCreateTokenByAuthCode = { request };
    try {
      const client = await this.conf.clientService.find(request.client_id);
      await this.conf.clientService.verifyClientWithRedirectUri(client, request.redirect_uri);

      const authCode = await this.conf.authCodeService.find(request.code);
      if (authCode.is_used) throw new PermisError('Access denied');
      // check expiry
      if (hasExpired(authCode.expires_at)) throw new PermisError('Auth code expired');

      const consent = await this.conf.consentService.find(authCode.consent_id);
      if (!consent.is_granted) throw new PermisError('Access denied');

      authCode.is_used = 1;
      await this.conf.authCodeService.update(request.code, authCode);

      const user_id = consent.user_id ?? '';
      const scope   = consent.scope;

      const expires_in = C.defaultAccessTokenExpiryInSeconds;

      const jwtPayload   = { client_id: client.id, user_id, scope };
      const accessToken  = await this.conf.securityService.generateJwt(jwtPayload, C.defaultAccessTokenExpiryInSeconds);
      const refreshToken = await this.conf.securityService.generateJwt(jwtPayload, C.defaultRefreshTokenExpiryInSeconds);

      const rawToken: Partial<ITokenDto> = {
        user_id,
        client_id:     request.client_id,
        scope:         consent.scope,
        token_type:    'bearer',
        access_token:  accessToken,
        refresh_token: refreshToken,
        access_token_expires_at:  expiresAtStr(C.defaultAccessTokenExpiryInSeconds),
        refresh_token_expires_at: expiresAtStr(C.defaultRefreshTokenExpiryInSeconds),
      }
      const token = await this.conf.tokenService.create(rawToken);
      response.success = {
        expires_in,
        token_type:    token.token_type,
        access_token:  token.access_token,
        refresh_token: token.refresh_token,
      };
    } catch (err) {
      response.error = {
        error: oauth2.ErrorTypeEnum.invalid_request,
        error_description: err instanceof Error ? err.message : undefined,
      };
    }
    return response;
  }

  async _tokenByCredentials(request: oauth2.IRequestToCreateTokenByCredentials): Promise<oauth2.IResponseToCreateTokenByCredentials> {
    const response: oauth2.IResponseToCreateTokenByCredentials = { request };
    try {
      const client = await this.conf.clientService.find(request.client_id);
      await this.conf.clientService.verifyClientWithSecret(client, request.client_secret);
      await this.conf.clientService.verifyClientWithRedirectUri(client, request.redirect_uri);

      const user_id = ''; // TODO: review user
      const scope = ''; // TODO: review scope

      const expires_in = C.defaultAccessTokenExpiryInSeconds;

      const jwtPayload   = { client_id: client.id, user_id, scope };
      const accessToken  = await this.conf.securityService.generateJwt(jwtPayload, C.defaultAccessTokenExpiryInSeconds);
      const refreshToken = await this.conf.securityService.generateJwt(jwtPayload, C.defaultRefreshTokenExpiryInSeconds);

      const rawToken: Partial<ITokenDto> = {
        user_id,
        scope,
        client_id:     client.id,
        token_type:    'bearer',
        access_token:  accessToken,
        refresh_token: refreshToken,
        access_token_expires_at:  expiresAtStr(C.defaultAccessTokenExpiryInSeconds),
        refresh_token_expires_at: expiresAtStr(C.defaultRefreshTokenExpiryInSeconds),
      }
      const token = await this.conf.tokenService.create(rawToken);
      response.success = {
        expires_in,
        token_type:    token.token_type,
        access_token:  token.access_token,
        refresh_token: token.refresh_token,
      };
    } catch (err) {
      response.error = {
        error: oauth2.ErrorTypeEnum.invalid_request,
        error_description: err instanceof Error ? err.message : undefined,
      };
    }
    return response;
  }

}
