import { IBaseDto, IdType } from '../../dto';

export interface IConsentService<T extends IConsentDto = IConsentDto> {
  find(id: IdType): Promise<T>;
  create(dto: Partial<T>): Promise<T>;
  update(id: IdType, dto: Partial<T>): Promise<boolean>;
}

/**
 * A resource consumer can ask permission, user (resource owner) can approve or reject
 */
 export interface IConsentDto extends IBaseDto {
  client_id:    IdType;
  redirect_uri: string;
  scope:        string; // use space for separating multiple scopes
  state?:       string | null; // given by consumer usually for cross-referencing

  expires_at:   string;
  user_id:      string | null; // fill in after approval or rejection
  is_granted:   number; // defaults to 0
}
export type IConsentDtoToWrite = Partial<Exclude<IConsentDto, 'id' | 'created_at' | 'updated_at'>>;
