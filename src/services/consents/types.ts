import { IBaseDto, IdType, IObject } from '../../dto';

export interface IConsentService<T extends IConsentDto = IConsentDto> {
  findMany(conditions: IObject): Promise<T[]>;
  create(dto: Partial<T>): Promise<T>;
  retrieve(id: IdType): Promise<T>;
  update(id: IdType, dto: Partial<T>): Promise<boolean>;
  delete_(id: IdType): Promise<boolean>;
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
export type IConsentDtoToWrite = Partial<Omit<IConsentDto, 'id' | 'created_at' | 'updated_at'>>;
