
// @ts-nocheck
import Client_BetterSqlite3 from 'knex/lib/dialects/better-sqlite3/index.js'
// @ts-nocheck
// import sqlDb from '../db.sqlite' with { 'type': 'sqlite' };
import { Database } from 'bun:sqlite'


import Knex from 'knex';

class BunSqliteDialect extends Client_BetterSqlite3 {
  // Override the driver to use bun:sqlite instead of better-sqlite3
  _driver() {
    return Database;
  }

  // Optional: Override other methods if needed for API differences
  // For example, if transaction handling varies, adjust here
}


const db = Knex({
  client: BunSqliteDialect,
  connection: {
    filename: './db.sqlite',
  },
  useNullAsDefault: true,
});

export default db;