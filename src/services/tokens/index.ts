import { IBaseDto, IdType } from '../types';

export interface ITokenService {
  find(id: IdType): Promise<ITokenDto>;
}

/**
 * Token model to be created when an auth code is used
 */
 export interface ITokenDto extends IBaseDto {
  client_id:      string;
  access_token:   string;
  refresh_token:  string;
  token_type:     string; // e.g. 'Bearer'
  expires_in_sec: number;
  user_id:        string | null;  // 3rd-party or not
  scope:          string; // use space to separate multiple scopes
}
export type ITokenDtoToWrite = Partial<Exclude<ITokenDto, 'id' | 'created_at' | 'updated_at'>>;
