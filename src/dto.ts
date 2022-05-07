export type IObject = Record<string, unknown>;

export type IdType      = string | number; // 'uuid' or integer
export type RawDateType = string | number; // 'iso-date-string' or integer

export interface IBaseDto extends IObject {
  id:          IdType;
  created_at?: RawDateType;
  updated_at?: RawDateType;
}
