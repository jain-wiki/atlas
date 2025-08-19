// ref: https://bun.sh/docs/api/sqlite.md

import { Database } from 'bun:sqlite';

export const db = new Database('db.sqlite', {
  // Don't create a new database file. If user needs to create a new database, they should run this file directly.
  //  cd apps/backend && bun run lib/db.ts
  create: false,
  strict: true,
});

db.exec('VACUUM;'); // Compact the database file when the application starts
db.exec('PRAGMA foreign_keys = ON;'); // Enable foreign key constraints
db.exec('PRAGMA journal_mode = WAL;'); // Enable Write-Ahead Logging for better concurrency


// Print sqlite version
const version = db.query('SELECT sqlite_version() AS version;').get();
// @ts-ignore
console.log('SQLite version:', version?.version);

// Graceful shutdown
process.on('exit', () => {
  try {
    db.exec('PRAGMA wal_checkpoint(TRUNCATE);');
  } catch (error) { } // Do nothing
  db.close();
});

process.on('SIGINT', () => {
  try {
    db.exec('PRAGMA wal_checkpoint(TRUNCATE);');
  } catch (error) { } // Do nothing
  db.close();
  process.exit(0);
});


// Initialize database schema, if this file is run directly.
// ```cd apps/backend && bun run lib/db.ts```
// @ts-ignore
import sqlText from './schema.sql' with { type: 'text' };
if (import.meta.main) {
  const db = new Database('db.sqlite', { create: true });
  db.exec(sqlText);
  console.log('Database initialized and ready to use. Ensure that the db.sqlite file is moved to the ``apps/backend/lib/`` directory.');
}