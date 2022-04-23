import { IBaseDto, IdType } from '../types';

export interface IAuthCodeService {
  find(id: IdType): Promise<IAuthCodeDto>;
}

/**
 * Authorization code model to be created when a consent is given (approved)
 */
 export interface IAuthCodeDto extends IBaseDto {
  consent_id:      string;
  expires_in_secs: number;
  is_used:         boolean | number; // 0 or 1
}
export type IAuthCodeDtoToWrite = Partial<Exclude<IAuthCodeDto, 'id' | 'created_at' | 'updated_at'>>;
