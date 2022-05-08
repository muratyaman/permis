import { randomUUID } from 'crypto';
import { addSeconds } from 'date-fns';
import { IObject, RawDateType } from '../dto';
import { ErrInvalidRequest } from '../errors';

export const ts = () => (new Date()).toISOString();

export const uuid = () => randomUUID();

export function expiresAt(secsInFuture: number): Date {
  const now = new Date();
  return addSeconds(now, secsInFuture);
}

export function expiresAtStr(secsInFuture: number): string {
  return expiresAt(secsInFuture).toISOString();
}

export function expiryForJwt(secsInFuture: number): string {
  const days = Math.round(secsInFuture / 60.0 / 60.0 / 24.0);
  return `${days}d`;
}

export function hasExpired(date: RawDateType): boolean {
  return new Date(date) < new Date();
}

export function assertBuffer(b: Buffer | undefined | null, errMsg = 'Buffer expected'): Buffer {
  if (b === undefined || b === null) throw new ErrInvalidRequest(errMsg);
  return b;
}

export function assertString(s: string | undefined | null, errMsg = 'String expected'): string {
  if (s === undefined || s === null || s.trim() === '') throw new ErrInvalidRequest(errMsg);
  return s;
}

export function objectPropAsString(obj: IObject, prop: string, defaultVal = ''): string {
  return !!obj && (typeof obj === 'object') && (prop in obj) && (typeof obj[prop] === 'string') ? String(obj[prop]) : defaultVal;
}
