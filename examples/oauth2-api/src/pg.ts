import { Pool } from 'pg';

export class PgDb {
  constructor(protected db: Pool) {}

  async findMany<T = any>(text: string, values: any[], name = ''): Promise<T[]> {
    const res = await this.db.query<T>({ text, values, name });
    return res.rows;
  }

  async find<T = any>(text: string, values: any[], name = ''): Promise<T | null> {
    const res = await this.db.query<T>({ text, values, name });
    return res.rows.length ? res.rows[0] : null;
  }

}
