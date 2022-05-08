import { IBaseDto, IdType, IObject } from '../../dto';

export interface IConsumerService<T extends IConsumerDto = IConsumerDto> {
  findMany(conditions: IObject): Promise<T[]>;
  create(dto: Partial<T>): Promise<T>;
  retrieve(id: IdType): Promise<T>;
  update(id: IdType, dto: Partial<T>): Promise<boolean>;
  delete_(id: IdType): Promise<boolean>;
}

/**
 * Third-party resource consumer
 */
export interface IConsumerDto extends IBaseDto {
  user_id?:   IdType; // also unique
  custom_id?: IdType | null;
  status?:    string | 'ACTIVE' | 'ON_HOLD' | 'CLOSED';
}
export type IConsumerDtoToWrite = Partial<Omit<IConsumerDto, 'id' | 'created_at' | 'updated_at'>>;
