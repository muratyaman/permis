// identify errors thrown by us
export class PermisError extends Error {
  name = 'PermisError';
}

export class ErrRecordNotFound extends PermisError {}

export class ErrorInvalidRequest extends PermisError {}
