import { ErrorTypeEnum } from './oauth2';

// identify errors thrown by us
export class PermisError extends Error {
  name = 'PermisError';
  code = ErrorTypeEnum.server_error;
}

export class ErrRecordNotFound extends PermisError {}

export class ErrAccessDenied extends PermisError {
  constructor(public message = '', public code = ErrorTypeEnum.access_denied) {
    super(message);
  }
}

export class ErrInvalidRequest extends PermisError {
  constructor(public message = '', public code = ErrorTypeEnum.invalid_request) {
    super(message);
  }
}

export class ErrInvalidScope extends PermisError {
  constructor(public message = '', public code = ErrorTypeEnum.invalid_scope) {
    super(message);
  }
}

export class ErrServerError extends PermisError {
  constructor(public message = '', public code = ErrorTypeEnum.server_error) {
    super(message);
  }
}

export class ErrUnauthorizedClient extends PermisError {
  constructor(public message = '', public code = ErrorTypeEnum.unauthorized_client) {
    super(message);
  }
}

export class ErrUnsupportedResponseType extends PermisError {
  constructor(public message = '', public code = ErrorTypeEnum.unsupported_response_type) {
    super(message);
  }
}
