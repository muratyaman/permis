import axios from 'axios';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import * as C from './constants';
import { RedisClient, RepoWithRedis } from './repos';
import * as s from './services';
import { IIdentityDto } from './services';
import { IPermisConfiguration, IPermisOptions } from './types';
import { assertBuffer, assertString } from './utils';

export class PermisConfigWithRedis implements IPermisConfiguration {
  options: IPermisOptions;

  // logger?: ...
  securityService: s.ISecurityService;
  identityService: s.IIdentityService<IIdentityDto>;

  authCodeService: s.IAuthCodeService<s.IAuthCodeDto>;
  clientService:   s.IClientService<s.IClientDto>;
  consentService:  s.IConsentService<s.IConsentDto>;
  consumerService: s.IConsumerService<s.IConsumerDto>;
  scopeService:    s.IScopeService<s.IScopeDto>;
  tokenService:    s.ITokenService<s.ITokenDto>;

  constructor(conf: Partial<IPermisConfiguration>, redis: RedisClient) {
    let   selfUrl   = conf?.options?.selfUrl ?? '';
    const idpAppUrl = conf?.options?.idpAppUrl ?? '';
    const idpApiUrl = conf?.options?.idpAppUrl ?? '';
    if (!idpAppUrl && !idpApiUrl) {
      selfUrl = assertString(selfUrl, 'selfUrl is required when idpAppUrl and idpApiUrl are not set');
    }

    const privateKey = assertBuffer(conf?.options?.privateKey, 'Private key missing');
    const publicKey  = assertBuffer(conf?.options?.publicKey, 'Public key missing');

    this.options = {
      selfUrl,
      idpAppUrl,
      idpApiUrl,
      logLevel:                  conf?.options?.logLevel ?? 'warn',
      allowEmptyState:           conf?.options?.allowEmptyState ?? false,
      authCodeExpiresInSecs:     conf?.options?.authCodeExpiresInSecs ?? C.defaultAuthCodeExpiryInSeconds,
      accessTokenExpiresInSecs:  conf?.options?.accessTokenExpiresInSecs ?? C.defaultAccessTokenExpiryInSeconds,
      refreshTokenExpiresInSecs: conf?.options?.refreshTokenExpiresInSecs ?? C.defaultRefreshTokenExpiryInSeconds,
      privateKey,
      publicKey,
    };

    this.securityService = new s.SecurityServiceDefault(privateKey, publicKey);

    this.authCodeService = new s.AuthCodeServiceWithRedis(new RepoWithRedis<s.IAuthCodeDto>('oauth2_auth_codes', redis));
    this.clientService   = new s.ClientServiceWithRedis  (new RepoWithRedis<s.IClientDto>  ('oauth2_clients',    redis), this.securityService);
    this.consentService  = new s.ConsentServiceWithRedis (new RepoWithRedis<s.IConsentDto> ('oauth2_consents',   redis));
    this.consumerService = new s.ConsumerServiceWithRedis(new RepoWithRedis<s.IConsumerDto>('oauth2_consumers',  redis));
    this.identityService = new s.IdentityServiceWithRedis(new RepoWithRedis<s.IIdentityDto>('oauth2_identity',   redis), this.securityService);
    this.scopeService    = new s.ScopeServiceWithRedis   (new RepoWithRedis<s.IScopeDto>   ('oauth2_scopes',     redis));
    this.tokenService    = new s.TokenServiceWithRedis   (new RepoWithRedis<s.ITokenDto>   ('oauth2_tokens',     redis), this.securityService);
  }
}
