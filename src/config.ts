import axios from 'axios';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import * as C from './constants';
import { IBaseDto } from './dto';
import { RedisClient, RepoWithRedis } from './repos';
import * as s from './services';
import { IPermisConfiguration, IPermisOptions } from './types';

export class PermisConfigWithRedis implements IPermisConfiguration {
  options: IPermisOptions;

  // logger?: ...
  securityService: s.ISecurityService;
  identityService: s.IIdentityService<IBaseDto>;

  authCodeService: s.IAuthCodeService<s.IAuthCodeDto>;
  clientService:   s.IClientService<s.IClientDto>;
  consentService:  s.IConsentService<s.IConsentDto>;
  consumerService: s.IConsumerService<s.IConsumerDto>;
  scopeService:    s.IScopeService<s.IScopeDto>;
  tokenService:    s.ITokenService<s.ITokenDto>;

  constructor(conf: Partial<IPermisConfiguration>, redis: RedisClient) {
    const privateKeyPath   = resolve('..', 'privateKey.pem');
    const publicKeyPath    = resolve('..', 'publicKey.pem');
    const privateKeyExists = existsSync(privateKeyPath);
    const publicKeyExists  = existsSync(publicKeyPath);
    this.options = {
      idpAppUrl:                'http://localhost:3000',
      idpApiUrl:                'http://localhost:3001',
      logLevel:                 'warn',
      allowEmptyState:           false,
      authCodeExpiresInSecs:     C.defaultAuthCodeExpiryInSeconds,
      accessTokenExpiresInSecs:  C.defaultAccessTokenExpiryInSeconds,
      refreshTokenExpiresInSecs: C.defaultRefreshTokenExpiryInSeconds,
      privateKey: privateKeyExists ? readFileSync(privateKeyPath) : Buffer.from('private-key-missing'),
      publicKey:  publicKeyExists  ? readFileSync(publicKeyPath) : Buffer.from('public-key-missing'),
      ...conf.options,
    };

    this.securityService = new s.SecurityServiceDefault(this.options.privateKey, this.options.publicKey);

    const idpAxios = axios.create({ baseURL: this.options.idpApiUrl });
    this.identityService = new s.IdentityServiceWithAxios(idpAxios);

    this.authCodeService = new s.AuthCodeServiceWithRedis(new RepoWithRedis<s.IAuthCodeDto>('oauth2_auth_codes', redis));
    this.clientService   = new s.ClientServiceWithRedis(new RepoWithRedis<s.IClientDto>('oauth2_clients', redis), this.securityService);
    this.consentService  = new s.ConsentServiceWithRedis(new RepoWithRedis<s.IConsentDto>('oauth2_consents', redis));
    this.consumerService = new s.ConsumerServiceWithRedis(new RepoWithRedis<s.IConsumerDto>('oauth2_consumers', redis));
    this.scopeService    = new s.ScopeServiceWithRedis(new RepoWithRedis<s.IScopeDto>('oauth2_scopes', redis));
    this.tokenService    = new s.TokenServiceWithRedis(new RepoWithRedis<s.ITokenDto>('oauth2_tokens', redis), this.securityService);
  }
}
