import { Pool } from 'pg';
export declare class PgDb {
    protected db: Pool;
    constructor(db: Pool);
    findMany<T = any>(text: string, values: any[], name?: string): Promise<T[]>;
    find<T = any>(text: string, values: any[], name?: string): Promise<T | null>;
}
