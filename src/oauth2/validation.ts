import { GrantTypeEnum, ResponseTypeEnum } from './types';

export const GRANT_TYPES: string[] = Object.values(GrantTypeEnum);

export const RESPONSE_TYPES: string[] = Object.values(ResponseTypeEnum);

export function isValidGrantType(gt: string): boolean {
  return GRANT_TYPES.includes(gt);
}

export function isValidResponseType(gt: string): boolean {
  return RESPONSE_TYPES.includes(gt);
}
