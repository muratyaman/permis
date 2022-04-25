import { IBaseDto } from '../../dto';

export interface IIdentityService<T extends IBaseDto = IBaseDto> {
  authenticate(input: IAuthenticateInput): Promise<T>;
}

export interface IIdentityDto extends IBaseDto {
  username:      string; // unique
  password_hash: string;
  email?:        string;
  name?:         string;
}
export type IIdentityDtoToWrite = Partial<Exclude<IIdentityDto, 'created_at' | 'updated_at'>>;

export interface IAuthenticateInput {
  token_type?: string | 'bearer';
  token: string;
}
