import { randomUUID } from 'crypto';
import { addSeconds } from 'date-fns';

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

export function hasExpired(date: string): boolean {
  return new Date(date) < new Date();
}
