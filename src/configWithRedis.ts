import * as C from './constants';
import { RedisClient, RepoWithRedis } from './repos';
import * as s from './services';
import { IIdentityDto } from './services';
import { IPermisConfiguration, IPermisOptions } from './types';
import { assertBuffer, assertString } from './utils';

export class PermisConfigWithRedis implements IPermisConfiguration {
  options: IPermisOptions;

  // logger?: ...

  public readonly authCodeRepo: RepoWithRedis<s.IAuthCodeDto>;
  public readonly clientRepo:   RepoWithRedis<s.IClientDto>;
  public readonly consentRepo:  RepoWithRedis<s.IConsentDto>;
  public readonly consumerRepo: RepoWithRedis<s.IConsumerDto>;
  public readonly identityRepo: RepoWithRedis<s.IIdentityDto>;
  public readonly scopeRepo:    RepoWithRedis<s.IScopeDto>;
  public readonly tokenRepo:    RepoWithRedis<s.ITokenDto>;

  securityService: s.ISecurityService;
  identityService: s.IIdentityService<IIdentityDto>;

  authCodeService: s.IAuthCodeService<s.IAuthCodeDto>;
  clientService:   s.IClientService<s.IClientDto>;
  consentService:  s.IConsentService<s.IConsentDto>;
  consumerService: s.IConsumerService<s.IConsumerDto>;
  scopeService:    s.IScopeService<s.IScopeDto>;
  tokenService:    s.ITokenService<s.ITokenDto>;

  constructor(options: Partial<IPermisOptions>, redis: RedisClient) {
    const {
      idpAppUrl                 = '',
      idpApiUrl                 = '',
      selfHosted                = true,
      logLevel                  = 'warn',
      allowEmptyState           = false,
      authCodeExpiresInSecs     = C.defaultAuthCodeExpiryInSeconds,
      accessTokenExpiresInSecs  = C.defaultAccessTokenExpiryInSeconds,
      refreshTokenExpiresInSecs = C.defaultRefreshTokenExpiryInSeconds,
    } = options;

    if (!selfHosted && !idpAppUrl && !idpApiUrl) {
      assertString('', 'selfHosted is required when idpAppUrl and idpApiUrl are not set');
    }

    const privateKey = assertBuffer(options?.privateKey, 'Private key missing');
    const publicKey  = assertBuffer(options?.publicKey, 'Public key missing');

    this.options = {
      selfHosted,
      idpAppUrl,
      idpApiUrl,
      logLevel,
      allowEmptyState,
      authCodeExpiresInSecs,
      accessTokenExpiresInSecs,
      refreshTokenExpiresInSecs,
      privateKey,
      publicKey,
    };

    this.securityService = new s.SecurityServiceDefault(privateKey, publicKey);

    this.authCodeRepo = new RepoWithRedis<s.IAuthCodeDto>('oauth2_auth_codes', redis);
    this.clientRepo   = new RepoWithRedis<s.IClientDto>  ('oauth2_clients',    redis);
    this.consentRepo  = new RepoWithRedis<s.IConsentDto> ('oauth2_consents',   redis);
    this.consumerRepo = new RepoWithRedis<s.IConsumerDto>('oauth2_consumers',  redis);
    this.identityRepo = new RepoWithRedis<s.IIdentityDto>('oauth2_identity',   redis);
    this.scopeRepo    = new RepoWithRedis<s.IScopeDto>   ('oauth2_scopes',     redis);
    this.tokenRepo    = new RepoWithRedis<s.ITokenDto>   ('oauth2_tokens',     redis);

    this.authCodeService = new s.AuthCodeServiceWithRedis(this.authCodeRepo, this.securityService);
    this.clientService   = new s.ClientServiceWithRedis  (this.clientRepo, this.securityService);
    this.consentService  = new s.ConsentServiceWithRedis (this.consentRepo);
    this.consumerService = new s.ConsumerServiceWithRedis(this.consumerRepo);
    this.identityService = new s.IdentityServiceWithRedis(this.identityRepo, this.securityService);
    this.scopeService    = new s.ScopeServiceWithRedis   (this.scopeRepo);
    this.tokenService    = new s.TokenServiceWithRedis   (this.tokenRepo, this.securityService);
  }
}
