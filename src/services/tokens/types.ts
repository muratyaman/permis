import { IBaseDto, IdType } from '../../dto';

export interface ITokenService<T extends ITokenDto = ITokenDto> {
  find(id: IdType): Promise<T>;
  create(dto: Partial<T>): Promise<T>;
  update(id: IdType, dto: Partial<T>): Promise<boolean>;
}

/**
 * Token model to be created when an auth code is used
 */
 export interface ITokenDto extends IBaseDto {
  client_id:  IdType;
  token_type: string | 'bearer'; // e.g. 'Bearer'

  access_token:             string;
  access_token_expires_at:  string;

  refresh_token:            string;
  refresh_token_expires_at: string;

  user_id: IdType;
  scope:   string; // use space to separate multiple scopes
  is_used: number; // change to 1 when refresh token is used
}
