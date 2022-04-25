export type IObject = Record<string, unknown>;

export type IdType = string; // | number

export interface IBaseDto extends IObject {
  id: IdType;
  created_at?: string;
  updated_at?: string;
}
