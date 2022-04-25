import { IBaseDto } from '../../dto';

export interface IAuthCodeService<T extends IAuthCodeDto = IAuthCodeDto> {
  find(code: string): Promise<T>;
  create(dto: Partial<T>): Promise<T>;
  update(code: string, dto: Partial<T>): Promise<boolean>;
}

/**
 * Authorization code model to be created when a consent is given (approved)
 */
 export interface IAuthCodeDto extends IBaseDto {
  consent_id: string;
  expires_at: string;
  is_used:    boolean | number; // 0 or 1
}
export type IAuthCodeDtoToWrite = Partial<Exclude<IAuthCodeDto, 'id' | 'created_at' | 'updated_at'>>;
