import { ErrorTypeEnum } from './oauth2';

// identify errors thrown by us
export class PermisError extends Error {
  name   = 'PermisError';
  code   = ErrorTypeEnum.server_error;
  status = 500;
}

export class ErrRecordNotFound extends PermisError {
  constructor(public message = '', public code = ErrorTypeEnum.invalid_request, public status = 404) {
    super(message);
  }
}

export class ErrInvalidRequest extends PermisError {
  constructor(public message = '', public code = ErrorTypeEnum.invalid_request, public status = 400) {
    super(message);
  }
}

export class ErrDuplicate extends ErrInvalidRequest {}
export class ErrBadRequest extends ErrInvalidRequest {}

export class ErrAccessDenied extends PermisError {
  constructor(public message = '', public code = ErrorTypeEnum.access_denied, public status = 403) {
    super(message);
  }
}



export class ErrInvalidScope extends ErrInvalidRequest {
  constructor(public message = '', public code = ErrorTypeEnum.invalid_scope) {
    super(message);
  }
}

export class ErrServerError extends PermisError {
  constructor(public message = '', public code = ErrorTypeEnum.server_error, public status = 500) {
    super(message);
  }
}

export class ErrUnauthorizedClient extends PermisError {
  constructor(public message = '', public code = ErrorTypeEnum.unauthorized_client, public status = 401) {
    super(message);
  }
}

export class ErrUnsupportedResponseType extends ErrInvalidRequest {
  constructor(public message = '', public code = ErrorTypeEnum.unsupported_response_type) {
    super(message);
  }
}
