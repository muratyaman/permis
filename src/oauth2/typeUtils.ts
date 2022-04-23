import { GrantTypeEnum, IRequestToCreateToken, IRequestToCreateTokenByAuthCode, IRequestToCreateTokenByCredentials } from './types';

export function isRequestToCreateTokenByAuthCode(r: IRequestToCreateToken): r is IRequestToCreateTokenByAuthCode {
  return r && r.grant_type && r.grant_type === GrantTypeEnum.authorization_code;
}

export function isRequestToCreateTokenByCredentials(r: IRequestToCreateToken): r is IRequestToCreateTokenByCredentials {
  return r && r.grant_type && r.grant_type === GrantTypeEnum.client_credentials;
}
