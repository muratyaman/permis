import { IBaseDto, IdType, IObject } from '../../dto';

export interface IScopeService<T extends IScopeDto = IScopeDto> {
  verifyScopes(scope: string[], client_id?: IdType): Promise<boolean>;
  findMany(conditions: IObject): Promise<T[]>;
  create(dto: Partial<T>): Promise<T>;
  retrieve(id: IdType): Promise<T>;
  update(id: IdType, dto: Partial<T>): Promise<boolean>;
  delete_(id: IdType): Promise<boolean>;
}

/**
 * Scope/Permission model
 */
export interface IScopeDto extends IBaseDto {
  // id like 'profile:read'
  description?: string | null;
}
export type IScopeDtoToWrite = Partial<Omit<IScopeDto, 'created_at' | 'updated_at'>>;
