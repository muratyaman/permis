import { IBaseDto, IdType } from '../types';

export interface IConsentService {
  find(id: IdType): Promise<IConsentDto>;
}

/**
 * A resource consumer can ask permission, user (resource owner) can approve or reject
 */
 export interface IConsentDto extends IBaseDto {
  client_id:     string;
  scope:         string; // use space for separating multiple scopes
  state?:        string | null; // given by consumer usually for cross-referencing
  redirect_uri:  string;
  expires_in_secs: number;
  user_id:         string | null; // fill in after approval or rejection
  status:          string;
}
export type IConsentDtoToWrite = Partial<Exclude<IConsentDto, 'id' | 'created_at' | 'updated_at'>>;
