import { IBaseDto, IdType, IObject, RawDateType } from '../../dto';

export interface IAuthCodeService<T extends IAuthCodeDto = IAuthCodeDto> {
  findMany(conditions: IObject): Promise<T[]>;
  findByCode(code: string): Promise<T>;
  create(dto: Partial<T>): Promise<T>;
  retrieve(id: IdType): Promise<T>;
  update(id: IdType, dto: Partial<T>): Promise<boolean>;
  delete_(id: IdType): Promise<boolean>;
}

/**
 * Authorization code model to be created when a consent is given (approved)
 */
export interface IAuthCodeDto extends IBaseDto {
  code:       string;
  consent_id: IdType;
  expires_at: RawDateType;
  status:     string | 'ACTIVE' | 'USED' | 'EXPIRED';
}
export type IAuthCodeDtoToWrite = Partial<Omit<IAuthCodeDto, 'id' | 'created_at' | 'updated_at'>>;
