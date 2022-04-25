import { IBaseDto, IdType } from '../../dto';

export interface IConsumerService<T extends IConsumerDto = IConsumerDto> {
  find(id: IdType): Promise<T>;
}

/**
 * Third-party resource consumer
 */
 export interface IConsumerDto extends IBaseDto {
  user_id:    IdType; // also unique
  custom_id?: IdType | null;
  status:     string;
}
export type IConsumerDtoToWrite = Partial<Exclude<IConsumerDto, 'id' | 'created_at' | 'updated_at'>>;
