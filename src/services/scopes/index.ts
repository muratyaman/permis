import { IBaseDto, IdType } from '../types';

export interface IScopeService {
  find(id: IdType): Promise<IScopeDto>;
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
