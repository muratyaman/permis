import { IBaseDto } from './dto';
import * as oauth2 from './oauth2';
import { IAuthCodeDto, IAuthCodeService } from './services/authCodes';
import { IClientDto, IClientService } from './services/clients';
import { IConsentDto, IConsentService } from './services/consents';
import { IConsumerDto, IConsumerService } from './services/consumers';
import { IIdentityService } from './services/identity';
import { IScopeDto, IScopeService } from './services/scopes';
import { ISecurityService } from './services/security';
import { ITokenDto, ITokenService } from './services/tokens';

export interface IPermisOptions {
  idpAppUrl:  string;
  idpApiUrl:  string;
  privateKey: Buffer;
  publicKey:  Buffer;

  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  allowEmptyState?:           boolean;
  authCodeExpiresInSecs?:     number;
  accessTokenExpiresInSecs?:  number;
  refreshTokenExpiresInSecs?: number;
}

export interface IPermisConfiguration<
  TIdentityModel extends IBaseDto     = IBaseDto,
  TAuthCodeModel extends IAuthCodeDto = IAuthCodeDto,
  TClientModel   extends IClientDto   = IClientDto,
  TConsentModel  extends IConsentDto  = IConsentDto,
  TConsumerModel extends IConsumerDto = IConsumerDto,
  TScopeModel    extends IScopeDto    = IScopeDto,
  TTokenModel    extends ITokenDto    = ITokenDto,
> {
  options: IPermisOptions;

  // logger?: ...
  securityService: ISecurityService;
  identityService: IIdentityService<TIdentityModel>;

  authCodeService: IAuthCodeService<TAuthCodeModel>;
  clientService:   IClientService<TClientModel>;
  consentService:  IConsentService<TConsentModel>;
  consumerService: IConsumerService<TConsumerModel>;
  scopeService:    IScopeService<TScopeModel>;
  tokenService:    ITokenService<TTokenModel>;
}

export interface IPermisService<
  TIdentityModel extends IBaseDto     = IBaseDto,
  TAuthCodeModel extends IAuthCodeDto = IAuthCodeDto,
  TClientModel   extends IClientDto   = IClientDto,
  TConsentModel  extends IConsentDto  = IConsentDto,
  TConsumerModel extends IConsumerDto = IConsumerDto,
  TScopeModel    extends IScopeDto    = IScopeDto,
  TTokenModel    extends ITokenDto    = ITokenDto,
> {
  conf: IPermisConfiguration<
    TIdentityModel,
    TAuthCodeModel,
    TClientModel,
    TConsentModel,
    TConsumerModel,
    TScopeModel,
    TTokenModel
  >;
  authorize(req: oauth2.IRequestToAuthorize): Promise<oauth2.IResponseToAuthorize>;
  authenticate(req: oauth2.IRequestToAuthenticate): Promise<oauth2.IResponseToAuthenticate>;
  token(req: oauth2.IRequestToCreateToken): Promise<oauth2.IResponseToCreateToken>;
}
