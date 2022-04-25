import { IBaseDto, IdType } from '../../dto';

export interface IScopeService<T extends IScopeDto = IScopeDto> {
  find(id: IdType): Promise<T>;
  verifyScopes(scope: string[]): Promise<boolean>;
}

/**
 * Scope/Permission model
 */
 export interface IScopeDto extends IBaseDto {
  // id like 'profile:read'
  title?:       string | null;
  description?: string | null;
}
export type IScopeDtoToWrite = Partial<Exclude<IScopeDto, 'created_at' | 'updated_at'>>;
