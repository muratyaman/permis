"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PgDb = void 0;
class PgDb {
    constructor(db) {
        this.db = db;
    }
    async findMany(text, values, name = '') {
        const res = await this.db.query({ text, values, name });
        return res.rows;
    }
    async find(text, values, name = '') {
        const res = await this.db.query({ text, values, name });
        return res.rows.length ? res.rows[0] : null;
    }
}
exports.PgDb = PgDb;
