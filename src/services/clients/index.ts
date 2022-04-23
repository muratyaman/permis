import { IBaseDto, IdType } from '../types';

export interface IClientService {
  find(id: IdType): Promise<IClientDto>;
  verifyClient(apiKey: string, apiSecret: string): Promise<IClientDto>;
}

/**
 * App with credentials - belongs to Consumer
 */
 export interface IClientDto extends IBaseDto {
  consumer_id:        string;
  name:               string;
  client_secret_hash: string;
  client_secret_salt: string | null;
  redirect_uris:      string; // use line-breaks to separate multiple URIs

  client_type:        string;
  status:             string;
}
export type IClientDtoToWrite = Partial<Exclude<IClientDto, 'id' | 'created_at' | 'updated_at'>>;
