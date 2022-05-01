import * as C from './constants';
import { ErrAccessDenied, ErrInvalidScope, ErrServerError, ErrUnauthorizedClient, PermisError } from './errors';
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

  authorize(req: Partial<oauth2.IRequestToAuthorize>): Promise<oauth2.IResponseToAuthorize> {
    try {
      const reqToFinish = oauth2.validateRequestToFinishAuthorization(req); // throws error
      return this._authorizeFinish(reqToFinish);
    } catch (err1) {
      try {
        const reqToStart = oauth2.validateRequestToStartAuthorization(req); // throws error
        return this._authorizeStart(reqToStart);
      } catch (err2) {
        throw err2;
      }
    }
  }

  async _authorizeStart(request: oauth2.IRequestToStartAuthorization): Promise<oauth2.IResponseToStartAuthorization> {
    const response: oauth2.IResponseToStartAuthorization = {
      request,
      redirect_uri: new URL(this.conf.options.idpAppUrl),
    };
    try {

      const client = await this.conf.clientService.find(request.client_id);
      if (!client) throw new ErrUnauthorizedClient();

      const clientVerified = await this.conf.clientService.verifyClientWithRedirectUri(client, request.redirect_uri);
      if (!clientVerified) throw new ErrUnauthorizedClient();

      const scopesVerified = await this.conf.scopeService.verifyScopes(request.scope.split(' '), client.id);
      if (!scopesVerified) throw new ErrInvalidScope();

      // prepare redirect URI for IdP App to authenticate and give consent
      response.redirect_uri.searchParams.append('client_id',    request.client_id);
      response.redirect_uri.searchParams.append('redirect_uri', request.redirect_uri);
      response.redirect_uri.searchParams.append('scope',        request.scope);
      if (request.state) response.redirect_uri.searchParams.append('state', request.state);
      if (request.nonce) response.redirect_uri.searchParams.append('nonce', request.nonce);

      const consent = await this.conf.consentService.create({
        client_id:    client.id,
        redirect_uri: request.redirect_uri,
        scope:        request.scope,
        state:        request.state,
      });

      response.success = {
        consent_id: consent.id,
      };
      response.redirect_uri.searchParams.append('consent_id', consent.id);

    } catch (err) {
      response.error = {
        error:             oauth2.ErrorTypeEnum.invalid_request, // no clues to hackers
        error_description: err instanceof Error ? err.message : undefined,
      };
    }

    return response;
  }

  async authenticate(request: Partial<oauth2.IRequestToAuthenticate>): Promise<oauth2.IResponseToAuthenticate> {
    const { token = '' } = request;
    const _request: oauth2.IRequestToAuthenticate = { token };
    const response: oauth2.IResponseToAuthenticate = { request: _request };

    try {
      const user = await this.conf.identityService.authenticate({ token });

      const accessToken = await this.conf.securityService.generateJwt({
        client_id: 'self', // TODO: review
        user_id:   user.id,
        scope:    'profile',
      }, C.defaultAccessTokenExpiryInSeconds);

      response.success = {
        token:   accessToken,
        user_id: user.id,
      };

    } catch (err) {
      response.error = {
        error:             oauth2.ErrorTypeEnum.invalid_request,
        error_description: err instanceof Error ? err.message : undefined,
      };
    }

    return response;
  }

  _isAllowed(allow: string): boolean {
    return allow === 'true';
  }

  async _authorizeFinish(request: oauth2.IRequestToFinishAuthorization): Promise<oauth2.IResponseToFinishAuthorization> {
    // NOTE: the server should only redirect the user to the redirect URL if the redirect URL has been registered!
    const response: oauth2.IResponseToFinishAuthorization = { request };
    try {
      const client = await this.conf.clientService.find(request.client_id);
      if (!client) throw new ErrUnauthorizedClient();

      const clientAndUriVerified = await this.conf.clientService.verifyClientWithRedirectUri(client, request.redirect_uri);
      if (!clientAndUriVerified) throw new ErrUnauthorizedClient();

      // prepare consumer's redirect URI
      const redirect_uri = new URL(request.redirect_uri);
      if (request.state) redirect_uri.searchParams.append('state', request.state);
      if (request.nonce) redirect_uri.searchParams.append('nonce', request.nonce);
      response.redirect_uri = redirect_uri;

      const isAllowed = this._isAllowed(request.allow);

      if (request.consent_id) { // update consent
        const consent = await this.conf.consentService.find(request.consent_id);
        consent.is_granted = isAllowed ? 1 : 0;
        await this.conf.consentService.update(consent.id, consent);
      }

      if (!isAllowed) throw new ErrAccessDenied();

      const authCode = await this.conf.authCodeService.create({
        client_id:  client.id,
        expires_at: expiresAtStr(C.defaultAuthCodeExpiryInSeconds),
        scope:      request.scope,
      });

      response.success = {
        code: authCode.id,
      };
      response.redirect_uri.searchParams.append('code', response.success.code);

    } catch (err) {

      response.error = {
        error:             err instanceof PermisError ? err.code : oauth2.ErrorTypeEnum.server_error,
        error_description: err instanceof Error ? err.message : undefined,
      };
      if (response.redirect_uri) response.redirect_uri.searchParams.append('error', response.error.error);
    }

    return response;
  }

  async createToken(req: Partial<oauth2.IRequestToCreateToken>): Promise<oauth2.IResponseToCreateToken> {
    try {
      const reqByCode = oauth2.validateRequestToCreateTokenByAuthCode(req); // throws error
      return this._createTokenByAuthCode(reqByCode);
    } catch (err1) {
      try {
        const reqByCredentials = oauth2.validateRequestToCreateTokenByCredentials(req); // throws error
        return this._createTokenByCredentials(reqByCredentials);
      } catch (err2) {
        throw err2;
      }
    }
  }

  async _createTokenByAuthCode(request: oauth2.IRequestToCreateTokenByAuthCode): Promise<oauth2.IResponseToCreateTokenByAuthCode> {
    const response: oauth2.IResponseToCreateTokenByAuthCode = { request };
    try {
      const client = await this.conf.clientService.find(request.client_id);
      if (!client) throw new ErrUnauthorizedClient();

      const clientAndUriVerified = await this.conf.clientService.verifyClientWithRedirectUri(client, request.redirect_uri);
      if (!clientAndUriVerified) throw new ErrUnauthorizedClient();

      const authCode = await this.conf.authCodeService.find(request.code);
      if (authCode.is_used) throw new ErrAccessDenied();
      if (hasExpired(authCode.expires_at)) throw new ErrAccessDenied();

      const consent = await this.conf.consentService.find(authCode.consent_id);
      if (!consent.is_granted) throw new ErrAccessDenied();

      authCode.is_used = 1;
      const authCodeUpdated = await this.conf.authCodeService.update(request.code, authCode);
      if (!authCodeUpdated) throw new ErrServerError();

      const user_id = consent.user_id ?? '';
      const scope   = consent.scope;

      const expires_in = C.defaultAccessTokenExpiryInSeconds;

      const jwtPayload    = { client_id: client.id, user_id, scope };
      const access_token  = await this.conf.securityService.generateJwt(jwtPayload, C.defaultAccessTokenExpiryInSeconds);
      const refresh_token = await this.conf.securityService.generateJwt(jwtPayload, C.defaultRefreshTokenExpiryInSeconds);
      const token_type    = 'bearer';

      const rawToken: Partial<ITokenDto> = {
        access_token,
        access_token_expires_at:  expiresAtStr(C.defaultAccessTokenExpiryInSeconds),
        client_id:                request.client_id,
        refresh_token,
        refresh_token_expires_at: expiresAtStr(C.defaultRefreshTokenExpiryInSeconds),
        scope:                    consent.scope,
        token_type,
        user_id,
      };

      const token = await this.conf.tokenService.create(rawToken);

      response.success = {
        access_token:  token.access_token,
        expires_in,
        refresh_token: token.refresh_token,
        token_type:    token.token_type,
      };

    } catch (err) {

      response.error = {
        error:             err instanceof PermisError ? err.code : oauth2.ErrorTypeEnum.server_error,
        error_description: err instanceof Error ? err.message : undefined,
      };
    }

    return response;
  }

  async _createTokenByCredentials(request: oauth2.IRequestToCreateTokenByCredentials): Promise<oauth2.IResponseToCreateTokenByCredentials> {
    const response: oauth2.IResponseToCreateTokenByCredentials = { request };
    try {
      const client = await this.conf.clientService.find(request.client_id);
      await this.conf.clientService.verifyClientWithSecret(client, request.client_secret);
      await this.conf.clientService.verifyClientWithRedirectUri(client, request.redirect_uri);

      const user_id = ''; // TODO: review user
      const scope   = ''; // TODO: review scope

      const expires_in = C.defaultAccessTokenExpiryInSeconds;

      const jwtPayload    = { client_id: client.id, user_id, scope };
      const access_token  = await this.conf.securityService.generateJwt(jwtPayload, C.defaultAccessTokenExpiryInSeconds);
      const refresh_token = await this.conf.securityService.generateJwt(jwtPayload, C.defaultRefreshTokenExpiryInSeconds);
      const token_type    = 'bearer';

      const rawToken: Partial<ITokenDto> = {
        access_token,
        access_token_expires_at:  expiresAtStr(C.defaultAccessTokenExpiryInSeconds),
        client_id:                client.id,
        refresh_token,
        refresh_token_expires_at: expiresAtStr(C.defaultRefreshTokenExpiryInSeconds),
        scope,
        token_type,
        user_id,
      };

      const token = await this.conf.tokenService.create(rawToken);

      response.success = {
        access_token:  token.access_token,
        expires_in,
        refresh_token: token.refresh_token,
        token_type:    token.token_type,
      };

    } catch (err) {

      response.error = {
        error:             err instanceof PermisError ? err.code : oauth2.ErrorTypeEnum.server_error,
        error_description: err instanceof Error ? err.message : undefined,
      };
    }

    return response;
  }

}
