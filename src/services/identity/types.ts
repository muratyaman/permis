import { IBaseDto, IdType, IObject } from '../../dto';

export interface IIdentityService<T extends IIdentityDto = IIdentityDto> {
  findMany(conditions: IObject): Promise<T[]>;
  findByUsername(username: string): Promise<T>;
  create(dto: Partial<T>): Promise<T>;
  retrieve(id: IdType): Promise<T>;
  update(id: IdType, dto: Partial<T>): Promise<boolean>;
  delete_(id: IdType): Promise<boolean>;
}

export interface IIdentityDto extends IBaseDto {
  username:      string; // unique
  password_hash: string;
  email?:        string;
  status:        string;
}
export type IIdentityDtoToWrite = Partial<Omit<IIdentityDto, 'id' | 'created_at' | 'updated_at'>>;
export type IIdentityDtoPublic  = Omit<IIdentityDto, 'password_hash'>;
