import { IBaseDto, IdType } from '../types';

export interface IConsumerService {
  find(id: IdType): Promise<IConsumerDto>;
}

/**
 * Third-party resource consumer
 */
 export interface IConsumerDto extends IBaseDto {
  user_id:    string; // also unique
  custom_id?: string | null;
  status:     string;
}
export type IConsumerDtoToWrite = Partial<Exclude<IConsumerDto, 'id' | 'created_at' | 'updated_at'>>;

