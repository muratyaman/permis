/**
 * Type definitions to help OAuth2 flow
 */

import { IBaseDto } from '../dto';
import { IJwtPayload } from '../types';

export interface IError {
  error:              ErrorTypeEnum;
  error_description?: string;
}

export type IRequestToAuthorize  = IRequestToStartAuthorization  | IRequestToFinishAuthorization;
export type IResponseToAuthorize = IResponseToStartAuthorization | IResponseToFinishAuthorization;

export interface IRequestToStartAuthorization {
  response_type:  ResponseType | ResponseTypeEnum;
  client_id:      string;
  redirect_uri:   string;
  scope:          string;
  state?:         string | null;
  nonce?:         string | null;
}
export interface IResponseToStartAuthorization {
  request:      IRequestToStartAuthorization;
  redirect_uri: URL | null;
  success?:     { consent_id: string; client: IBaseDto };
  error?:       IError;
}

export interface IRequestToFinishAuthorization extends IRequestToStartAuthorization {
  allow:           string | 'true' | 'false';
  consent_id?:     string | null;
  approval_token?: string | null;
}

export interface IResponseToFinishAuthorization {
  request:       IRequestToFinishAuthorization;
  redirect_uri?: URL | null;
  success?:      { code: string; }
  error?:        IError;
}

export type IRequestToCreateToken  = IRequestToCreateTokenByAuthCode | IRequestToCreateTokenByCredentials;
export type IResponseToCreateToken = IResponseToCreateTokenByAuthCode | IResponseToCreateTokenByCredentials;

export interface IRequestToCreateTokenByAuthCode {
  grant_type:     string | 'authorization_code';
  client_id:      string;
  redirect_uri:   string;
  code:           string; // authorization code
}

export interface IRequestToCreateTokenByCredentials {
  grant_type:    string | 'client_credentials';
  client_id:     string;
  redirect_uri:  string;
  client_secret: string; // credentials
}

export interface ITokenOutput {
  token_type:    string | 'bearer';
  access_token:  string;
  expires_in:    number; // access token expires in seconds
  refresh_token: string;
}

export interface IResponseToCreateTokenByAuthCode {
  request:  IRequestToCreateTokenByAuthCode;
  success?: ITokenOutput;
  error?:   IError;
}

export interface IResponseToCreateTokenByCredentials {
  request:  IRequestToCreateTokenByCredentials;
  success?: ITokenOutput;
  error?:   IError;
}

export interface IRequestToAuthenticate {
  token:       string; // validate using IdP service
  token_type?: string;
}

export interface IResponseToAuthenticate {
  request:  IRequestToAuthenticate;
  success?: IJwtPayload;
  error?:   IError;
}

// DEFINE ENUMS BELOW  * * * * * * * * *

export type ResponseType = 'code' | 'token';

export enum ResponseTypeEnum {
  code  = 'code',
  token = 'token',
}

export type GrantType =
  | 'authorization_code'
  | 'client_credentials'
  | 'password'
  | 'refresh_token'
;

export enum GrantTypeEnum {
  authorization_code = 'authorization_code',
  client_credentials = 'client_credentials',
  password           = 'password',
  refresh_token      = 'refresh_token',
}

export type ErrorType = 
  | 'access_denied'
  | 'invalid_request'
  | 'invalid_scope'
  | 'server_error'
  | 'temporarily_unavailable'
  | 'unauthorized_client'
  | 'unsupported_response_type'
;

export enum ErrorTypeEnum {
  access_denied             = 'access_denied',
  invalid_request           = 'invalid_request',
  invalid_scope             = 'invalid_scope',
  server_error              = 'server_error',
  temporarily_unavailable   = 'temporarily_unavailable',
  unauthorized_client       = 'unauthorized_client',
  unsupported_response_type = 'unsupported_response_type',
}
