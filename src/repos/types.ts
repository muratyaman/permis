import { IObject } from '../dto';

export interface IRepo<T = any> {
  name: string;
  findMany(conditions: IObject): Promise<T[]>;
  create(id: string, dto: T): Promise<boolean>;
  retrieve(id: string): Promise<T>;
  update(id: string, dto: T): Promise<boolean>;
  delete_(id: string): Promise<boolean>;
}
