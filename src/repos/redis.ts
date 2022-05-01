import { createClient } from 'redis';
import { IRepo } from './types';
import { IObject } from '../dto';
import { ErrDuplicate, ErrRecordNotFound } from '../errors';

const makeKeyMaker = (name: string) => {
  return (id: string) => `${name}:${id}`;
}

const makeId = (key: string) => key.split(':')[1];

export type RedisClient = ReturnType<typeof createClient>;

export class RepoWithRedis<T extends IObject = IObject> implements IRepo<T> {

  _key: (id: string) => string;

  constructor(public name: string, protected r: RedisClient) {
    this._key = makeKeyMaker(name);
  }

  _filter(row: T, conditions: IObject): boolean {
    const filters = Object.entries(conditions);
    const matchRequired = filters.length;
    let match = 0;
    for (const[k, v] of filters) {
      if ((k in row) && (typeof row[k] === typeof v) && (row[k] === v)) match += 1;
    }
    return match === matchRequired;
  }

  async findMany(conditions: IObject): Promise<T[]> {
    const keys = await this.r.KEYS(this._key('*'));
    const rows: T[] = [];
    for (const key of keys) {
      const row = await this.retrieve(makeId(key));
      if (this._filter(row, conditions)) rows.push(row);
    }
    return rows;
  }

  async create(id: string, dto: Partial<T>): Promise<boolean> {
    try {
      const found = await this.retrieve(id);
      if (found) throw new ErrDuplicate('duplicate id');
    } catch (err) {
      if (err instanceof ErrDuplicate) throw err;
    }
    const json = JSON.stringify(dto);
    await this.r.SET(this._key(id), json);
    return true;
  }

  async retrieve(id: string): Promise<T> {
    const json = await this.r.GET(this._key(id));
    if (!json) throw new ErrRecordNotFound('record not found');
    return JSON.parse(json) as T; // pretending
  }

  async update(id: string, dto: Partial<T>): Promise<boolean> {
    const row = await this.retrieve(id);
    const merged = { ...row, ...dto };
    return this.create(this._key(id), merged);
  }

  async delete_(id: string): Promise<boolean> {
    await this.r.DEL(this._key(id));
    return true;
  }
}
