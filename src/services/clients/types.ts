import { IBaseDto, IdType, IObject } from '../../dto';

export interface IClientService<T extends IClientDto = IClientDto> {
  verifyClientWithSecret(client: IClientDto, secret: string): Promise<boolean>;
  verifyClientWithRedirectUri(client: IClientDto, redirect_uri: string): Promise<boolean>;
  findMany(conditions: IObject): Promise<T[]>;
  create(dto: Partial<T>): Promise<T>;
  retrieve(id: IdType): Promise<T>;
  update(id: IdType, dto: Partial<T>): Promise<boolean>;
  delete_(id: IdType): Promise<boolean>;
}

/**
 * App with credentials - belongs to Consumer
 */
 export interface IClientDto extends IBaseDto {
  consumer_id:        IdType;
  client_secret_hash: string;
  redirect_uris:      string; // use line-breaks to separate multiple URIs

  name?:              string; // application name/description given by consumer
  grant_types?:       string; // use spaces to separate multiple grant types

  access_token_expiry_in_secs?:  number; // to override default setting
  refresh_token_expiry_in_secs?: number; // to override default setting

  client_type?:       string;
  status?:            string;
}
export type IClientDtoToWrite = Partial<Omit<IClientDto, 'id' | 'created_at' | 'updated_at'>>;
