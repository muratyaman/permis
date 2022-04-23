import { IBaseDto, IdType } from '../types';

export interface IIdentityService {
  find(id: IdType): Promise<IIdentityDto>;
}

export interface IIdentityDto extends IBaseDto {
  username?: string;
  email?: string;
}

export interface IIdentityService {
  getUser(id: string): Promise<IIdentityDto>;
}
