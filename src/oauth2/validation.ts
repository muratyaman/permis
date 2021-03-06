import { ErrInvalidRequest } from '../errors';
import { GrantType, GrantTypeEnum, IRequestToCreateTokenByAuthCode, IRequestToCreateTokenByCredentials, IRequestToFinishAuthorization, IRequestToStartAuthorization, ResponseType, ResponseTypeEnum } from './types';

export const GRANT_TYPES: string[] = Object.values(GrantTypeEnum);

export const RESPONSE_TYPES: string[] = Object.values(ResponseTypeEnum);

export function isValidGrantType(gt: string | null | undefined): boolean {
  return !!gt && GRANT_TYPES.includes(gt);
}

export function checkGrantType(gt: string | null | undefined): gt is GrantType {
  if (!gt) throw new ErrInvalidRequest('"grant_type" required');
  if (!isValidGrantType(gt)) throw new ErrInvalidRequest('invalid "grant_type"');
  return true;
}

export function isValidResponseType(rt: string | null | undefined): boolean {
  return !!rt && RESPONSE_TYPES.includes(rt);
}

export function checkResponseType(rt: string | null | undefined): rt is ResponseType {
  if (!rt) throw new ErrInvalidRequest('"response_type" required');
  if (!isValidResponseType(rt)) throw new ErrInvalidRequest('invalid "response_type"');
  return true;
}

export function checkClientAndUri(client_id: string | null | undefined, redirect_uri: string | null | undefined): boolean {
  if (!client_id) throw new ErrInvalidRequest('"client_id" required');
  if (!redirect_uri) throw new ErrInvalidRequest('"redirect_uri" required');
  return true;
}

export function validateRequestToStartAuthorization(req: Partial<IRequestToStartAuthorization>): IRequestToStartAuthorization {
  const { response_type = 'code', client_id = '', redirect_uri = '', scope = '', state = null, nonce = null } = req;
  checkResponseType(response_type);
  checkClientAndUri(client_id, redirect_uri);
  if (!scope) throw new ErrInvalidRequest('"scope" required');
  return { response_type, client_id, redirect_uri, scope, state, nonce };
}

export function validateRequestToFinishAuthorization(req: Partial<IRequestToFinishAuthorization>): IRequestToFinishAuthorization {
  const { response_type = 'code', client_id = '', redirect_uri = '', scope = '', state = null, nonce = null, allow = '', consent_id = null, approval_token = null } = req;
  checkResponseType(response_type);
  checkClientAndUri(client_id, redirect_uri);
  if (!scope) throw new ErrInvalidRequest('"scope" required');
  if (!allow) throw new ErrInvalidRequest('"allow" required');
  return { response_type, client_id, redirect_uri, scope, state, nonce, allow, consent_id, approval_token };
}

export function validateRequestToCreateTokenByAuthCode(req: Partial<IRequestToCreateTokenByAuthCode>): IRequestToCreateTokenByAuthCode {
  const { grant_type = '', client_id = '', redirect_uri = '', code = '' } = req;
  checkGrantType(grant_type);
  checkClientAndUri(client_id, redirect_uri);
  if (!code) throw new ErrInvalidRequest('"code" required');
  return { grant_type, client_id, redirect_uri, code };
}

export function validateRequestToCreateTokenByCredentials(req: Partial<IRequestToCreateTokenByCredentials>): IRequestToCreateTokenByCredentials {
  const { grant_type = '', client_id = '', redirect_uri = '', client_secret = '' } = req;
  checkGrantType(grant_type);
  checkClientAndUri(client_id, redirect_uri);
  if (!client_secret) throw new ErrInvalidRequest('"client_secret" required');
  return { grant_type, client_id, redirect_uri, client_secret };
}
