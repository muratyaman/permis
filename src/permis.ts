import * as C from './constants';
import { ErrAccessDenied, ErrInvalidScope, ErrServerError, ErrUnauthorizedClient, PermisError } from './errors';
import * as oauth2 from './oauth2';
import { ITokenDto } from './services';
import { IPermisConfiguration, IPermisService } from './types';
import { assertString, expiresAtStr, hasExpired } from './utils';

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

  // proxy method for convenience
  authorize(req: Partial<oauth2.IRequestToAuthorize>): Promise<oauth2.IResponseToAuthorize> {
    let err: unknown | null = null, reqToFinish: oauth2.IRequestToFinishAuthorization | null = null;
    try {
      reqToFinish = oauth2.validateRequestToFinishAuthorization(req); // throws error
    } catch (err1) {
      err = err1;
    }
    if (reqToFinish) return this.authorizeFinish(reqToFinish);

    let reqToStart: oauth2.IRequestToStartAuthorization | null = null;
    try {
      reqToStart = oauth2.validateRequestToStartAuthorization(req); // throws error
    } catch (err2) {
      err = err2;
    }
    if (!reqToStart) throw err;
    return this.authorizeStart(reqToStart);
  }

  _idpAppUrl(): URL | null {
    if (this.conf.options?.selfHosted ?? false) return null;
    const url = assertString(this.conf.options.idpAppUrl ?? '', 'idpAppUrl is required if not selfHosted');
    return new URL(url);
  }

  async authorizeStart(request: oauth2.IRequestToStartAuthorization): Promise<oauth2.IResponseToStartAuthorization> {
    const response: oauth2.IResponseToStartAuthorization = {
      request,
      redirect_uri: this._idpAppUrl(),
    };
    try {

      const client = await this.conf.clientService.retrieve(request.client_id);
      if (!client) throw new ErrUnauthorizedClient();

      const clientVerified = await this.conf.clientService.verifyClientWithRedirectUri(client, request.redirect_uri);
      if (!clientVerified) throw new ErrUnauthorizedClient();

      const scopesVerified = await this.conf.scopeService.verifyScopes(request.scope.split(' '), client.id);
      if (!scopesVerified) throw new ErrInvalidScope();

      // prepare redirect URI for IdP App to authenticate and give consent
      if (response.redirect_uri) {
        response.redirect_uri.searchParams.append('client_id',    request.client_id);
        response.redirect_uri.searchParams.append('redirect_uri', request.redirect_uri);
        response.redirect_uri.searchParams.append('scope',        request.scope);
        if (request.state) response.redirect_uri.searchParams.append('state', request.state);
        if (request.nonce) response.redirect_uri.searchParams.append('nonce', request.nonce);
      }

      const consent = await this.conf.consentService.create({
        client_id:    client.id,
        redirect_uri: request.redirect_uri,
        scope:        request.scope,
        state:        request.state,
      });

      response.success = {
        consent_id: String(consent.id),
        client,
      };
      if (response.redirect_uri) response.redirect_uri.searchParams.append('consent_id', String(consent.id));

    } catch (err) {
      response.error = {
        error:             oauth2.ErrorTypeEnum.invalid_request, // no clues to hackers
        error_description: err instanceof Error ? err.message : undefined,
      };
    }

    return response;
  }

  async authenticate(request: Partial<oauth2.IRequestToAuthenticate>): Promise<oauth2.IResponseToAuthenticate> {
    let { token = '' } = request;
    const _request: oauth2.IRequestToAuthenticate = { token };
    const response: oauth2.IResponseToAuthenticate = { request: _request };
    
    try {
      token = assertString(token, 'Token required');
      const decoded = await this.conf.securityService.verifyJwt(token);
      response.success = decoded;

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

  async authorizeFinish(request: oauth2.IRequestToFinishAuthorization): Promise<oauth2.IResponseToFinishAuthorization> {
    // NOTE: the server should only redirect the user to the redirect URL if the redirect URL has been registered!
    const response: oauth2.IResponseToFinishAuthorization = { request };
    try {
      const client = await this.conf.clientService.retrieve(request.client_id);
      if (!client) throw new ErrUnauthorizedClient();

      const clientAndUriVerified = await this.conf.clientService.verifyClientWithRedirectUri(client, request.redirect_uri);
      if (!clientAndUriVerified) throw new ErrUnauthorizedClient();

      // prepare consumer's redirect URI
      response.redirect_uri = new URL(request.redirect_uri);
      if (request.state) response.redirect_uri.searchParams.append('state', request.state);
      if (request.nonce) response.redirect_uri.searchParams.append('nonce', request.nonce);

      const isAllowed = this._isAllowed(request.allow);

      if (request.consent_id) { // update consent
        const consent = await this.conf.consentService.retrieve(request.consent_id);
        consent.is_granted = isAllowed ? 1 : 0;
        await this.conf.consentService.update(consent.id, consent);
      }

      if (!isAllowed) throw new ErrAccessDenied();

      const authCode = await this.conf.authCodeService.create({
        client_id:  client.id,
        expires_at: expiresAtStr(C.defaultAuthCodeExpiryInSeconds),
        scope:      request.scope,
      });

      response.success = { code: String(authCode.id) };
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

  // proxy method for convenience
  async createToken(req: Partial<oauth2.IRequestToCreateToken>): Promise<oauth2.IResponseToCreateToken> {
    let err: unknown | null = null, reqByCode: oauth2.IRequestToCreateTokenByAuthCode | null = null;
    try {
      reqByCode = oauth2.validateRequestToCreateTokenByAuthCode(req); // throws error
    } catch (err1) {
      err = err1;
    }
    if (reqByCode) return this.createTokenByAuthCode(reqByCode);

    let reqByCredentials: oauth2.IRequestToCreateTokenByCredentials | null = null;
    try {
      reqByCredentials = oauth2.validateRequestToCreateTokenByCredentials(req); // throws error
    } catch (err2) {
      err = err2;
    }
    if (!reqByCredentials) throw err;
    return this.createTokenByCredentials(reqByCredentials);
  }

  async createTokenByAuthCode(request: oauth2.IRequestToCreateTokenByAuthCode): Promise<oauth2.IResponseToCreateTokenByAuthCode> {
    const response: oauth2.IResponseToCreateTokenByAuthCode = { request };
    try {
      const client = await this.conf.clientService.retrieve(request.client_id);
      if (!client) throw new ErrUnauthorizedClient();

      const clientAndUriVerified = await this.conf.clientService.verifyClientWithRedirectUri(client, request.redirect_uri);
      if (!clientAndUriVerified) throw new ErrUnauthorizedClient();

      const authCode = await this.conf.authCodeService.findByCode(request.code);
      if (authCode.status !== 'PENDING') throw new ErrAccessDenied();
      if (hasExpired(authCode.expires_at)) throw new ErrAccessDenied();

      const consent = await this.conf.consentService.retrieve(authCode.consent_id);
      if (!consent.is_granted) throw new ErrAccessDenied();

      authCode.status = 'USED';
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

  // TODO
  //async _createTokenByRefreshToken(request: oauth2.IRequestToCreateTokenByRefreshToken): Promise<oauth2.IResponseToCreateTokenByRefreshToken> {}

  async createTokenByCredentials(request: oauth2.IRequestToCreateTokenByCredentials): Promise<oauth2.IResponseToCreateTokenByCredentials> {
    const response: oauth2.IResponseToCreateTokenByCredentials = { request };
    try {
      const client = await this.conf.clientService.retrieve(request.client_id);
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
