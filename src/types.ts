import { IdType } from './dto';
import * as oauth2 from './oauth2';
import { IAuthCodeDto, IAuthCodeService } from './services/authCodes';
import { IClientDto, IClientService } from './services/clients';
import { IConsentDto, IConsentService } from './services/consents';
import { IConsumerDto, IConsumerService } from './services/consumers';
import { IIdentityDto, IIdentityService } from './services/identity';
import { IScopeDto, IScopeService } from './services/scopes';
import { ISecurityService } from './services/security';
import { ITokenDto, ITokenService } from './services/tokens';

export interface IPermisOptions {
  idpAppUrl?: string; // default '' ==> means self is host
  idpApiUrl?: string; // default '' ==> means self is host
  selfUrl?:   string; // required if idpAppUrl and idpApiUrl are missing
  privateKey: Buffer;
  publicKey:  Buffer;

  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  allowEmptyState?:           boolean;
  authCodeExpiresInSecs?:     number;
  accessTokenExpiresInSecs?:  number;
  refreshTokenExpiresInSecs?: number;
}

export interface IPermisConfiguration<
  TAuthCodeModel extends IAuthCodeDto = IAuthCodeDto,
  TClientModel   extends IClientDto   = IClientDto,
  TConsentModel  extends IConsentDto  = IConsentDto,
  TConsumerModel extends IConsumerDto = IConsumerDto,
  TIdentityModel extends IIdentityDto = IIdentityDto,
  TScopeModel    extends IScopeDto    = IScopeDto,
  TTokenModel    extends ITokenDto    = ITokenDto,
> {
  options: IPermisOptions;

  // logger?: ...
  securityService: ISecurityService;

  authCodeService: IAuthCodeService<TAuthCodeModel>;
  clientService:   IClientService<TClientModel>;
  consentService:  IConsentService<TConsentModel>;
  consumerService: IConsumerService<TConsumerModel>;
  identityService: IIdentityService<TIdentityModel>;
  scopeService:    IScopeService<TScopeModel>;
  tokenService:    ITokenService<TTokenModel>;
}

export interface IPermisService<
  TAuthCodeModel extends IAuthCodeDto = IAuthCodeDto,
  TClientModel   extends IClientDto   = IClientDto,
  TConsentModel  extends IConsentDto  = IConsentDto,
  TConsumerModel extends IConsumerDto = IConsumerDto,
  TIdentityModel extends IIdentityDto = IIdentityDto,
  TScopeModel    extends IScopeDto    = IScopeDto,
  TTokenModel    extends ITokenDto    = ITokenDto,
> {
  conf: IPermisConfiguration<
    TAuthCodeModel,
    TClientModel,
    TConsentModel,
    TConsumerModel,
    TIdentityModel,
    TScopeModel,
    TTokenModel
  >;
  authorize(req: Partial<oauth2.IRequestToAuthorize>): Promise<oauth2.IResponseToAuthorize>;
  authenticate(req: Partial<oauth2.IRequestToAuthenticate>): Promise<oauth2.IResponseToAuthenticate>;
  createToken(req: Partial<oauth2.IRequestToCreateToken>): Promise<oauth2.IResponseToCreateToken>;
}

export interface IJwtPayload {
  client_id: IdType;
  user_id:   IdType;
  scope:     string; // use space to separate multiple scopes
  issuer?:   string;
}
