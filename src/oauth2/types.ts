export enum GrantTypeEnum {
  authorization_code = 'authorization_code',
  client_credentials = 'client_credentials',
  password           = 'password',
  refresh_token      = 'refresh_token',
}

export enum ResponseTypeEnum {
  code  = 'code',
  token = 'token',
}

export enum ErrorTypeEnum {
  access_denied             = 'access_denied',
  invalid_request           = 'invalid_request',
  invalid_scope             = 'invalid_scope',
  server_error              = 'server_error',
  temporarily_unavailable   = 'temporarily_unavailable',
  unauthorized_client       = 'unauthorized_client',
  unsupported_response_type = 'unsupported_response_type',
}

export interface IError {
  error: ErrorTypeEnum;
  error_description?: string;
}

export interface IRequestToStartAuthorization {
  response_type:  string; // 'code'
  client_id:      string;
  redirect_uri:   string;
  scope:          string;
  state:          string;
  nonce?:         string | null;
}
export interface IResponseToStartAuthorization {
  request: IRequestToStartAuthorization;
  success?: { consent_id: string; };
  error?: IError;
}

export interface IRequestToFinishAuthorization extends IRequestToStartAuthorization {
  consent_id:     string;
  approval_token: string;
}

export interface IResponseToFinishAuthorization {
  request: IRequestToFinishAuthorization;
  success?: { code: string; }
  error?: IError;
}

export type IRequestToCreateToken = IRequestToCreateTokenByAuthCode | IRequestToCreateTokenByCredentials;

export interface IRequestToCreateTokenByAuthCode {
  grant_type:     'authorization_code';
  client_id:      string;
  redirect_uri:   string;
  code:           string; // authorization code
}

export interface IRequestToCreateTokenByCredentials {
  grant_type:    'client_credentials';
  client_id:     string;
  redirect_uri:  string;
  client_secret: string; // credentials
}

export interface IResponseCreateToken {
  request: IRequestToCreateToken;
  success?: {
    token_type:    string;
    access_token:  string;
    expires_in:    number; // in seconds
    refresh_token: string;
  };
  error?: IError;
}

