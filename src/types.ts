import * as oauth2 from './oauth2';
import { IClientService, IConsumerService, IIdentityService, ITokenService } from './services';

export interface IPermisOptions {
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export interface IPermisConfiguration {
  options?:         IPermisOptions;
  // logger?: ...
  authCodeService?: IClientService;
  clientService?:   IClientService;
  consentService?:  IClientService;
  consumerService?: IConsumerService;
  identityService?: IIdentityService;
  tokenService?:    ITokenService;
}

export interface IPermisService {
  conf: IPermisConfiguration;
  authorizeStart(req: oauth2.IRequestToStartAuthorization): Promise<oauth2.IResponseToStartAuthorization>;
  authorizeFinish(req: oauth2.IRequestToFinishAuthorization): Promise<oauth2.IResponseToFinishAuthorization>;
}
