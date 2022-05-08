import { IBaseDto, IdType, IObject, RawDateType } from '../../dto';

export interface ITokenService<T extends ITokenDto = ITokenDto> {
  findMany(conditions: IObject): Promise<T[]>;
  create(dto: Partial<T>): Promise<T>;
  retrieve(id: IdType): Promise<T>;
  update(id: IdType, dto: Partial<T>): Promise<boolean>;
  delete_(id: IdType): Promise<boolean>;
}

/**
 * Token model to be created when an auth code is used
 */
export interface ITokenDto extends IBaseDto {
  client_id:  IdType;
  token_type: string | 'bearer'; // e.g. 'Bearer'

  access_token:             string;
  access_token_expires_at:  RawDateType;

  refresh_token:            string;
  refresh_token_expires_at: RawDateType;

  user_id: IdType;
  scope:   string;  // use space to separate multiple scopes
  status:  string | 'ACTIVE' | 'INACTIVE' | 'EXPIRED'; // change to 'INACTIVE' when refresh token is used
}
