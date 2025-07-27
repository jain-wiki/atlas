import Knex from 'knex';

const db = Knex({
  client: 'better-sqlite3',
  connection: {
    filename: './db.sqlite',
  },
  useNullAsDefault: true,
});

export default db;