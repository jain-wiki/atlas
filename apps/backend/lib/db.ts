// ref: https://bun.sh/docs/api/sqlite.md

import { Database, } from 'bun:sqlite';

export const db = new Database('db.sqlite', {
  create: true,
  strict: true,
});

db.exec('VACUUM;'); // Compact the database file when the application starts
db.exec('PRAGMA foreign_keys = ON;'); // Enable foreign key constraints
db.exec('PRAGMA journal_mode = WAL;'); // Enable Write-Ahead Logging for better concurrency

