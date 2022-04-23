export type IdType = string | number;

export interface IHasId {
  id: IdType;
}

export interface IHasTimestamps {
  created_at?: string;
  updated_at?: string;
}

export type IBaseDto = IHasId & IHasTimestamps;
