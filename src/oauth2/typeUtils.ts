import { GrantTypeEnum, IRequestToAuthorize, IRequestToCreateToken, IRequestToCreateTokenByAuthCode, IRequestToCreateTokenByCredentials, IRequestToFinishAuthorization, IRequestToStartAuthorization } from './types';

const PROP_NAME_ALLOW = 'allow';

export function isRequestToStartAuthorization(r: IRequestToAuthorize): r is IRequestToStartAuthorization {
  return !!r && !!r.client_id && !!r.redirect_uri && !!r.response_type && !!r.scope && !(PROP_NAME_ALLOW in r);
}

export function isRequestToFinishAuthorization(r: IRequestToAuthorize): r is IRequestToFinishAuthorization {
  return !!r && !!r.client_id && !!r.redirect_uri && !!r.response_type && !!r.scope && (PROP_NAME_ALLOW in r);
}

export function isRequestToCreateTokenByAuthCode(r: IRequestToCreateToken): r is IRequestToCreateTokenByAuthCode {
  return !!r && !!r.grant_type && (r.grant_type === GrantTypeEnum.authorization_code);
}

export function isRequestToCreateTokenByCredentials(r: IRequestToCreateToken): r is IRequestToCreateTokenByCredentials {
  return !!r && !!r.grant_type && (r.grant_type === GrantTypeEnum.client_credentials);
}
