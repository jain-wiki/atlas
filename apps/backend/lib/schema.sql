-- Disable foreign key constraints (temporarily for schema creation)
PRAGMA foreign_keys = OFF;

-- Create user table
CREATE TABLE IF NOT EXISTS user (
    id TEXT NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    emailVerified INTEGER NOT NULL,
    image TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
) STRICT, WITHOUT ROWID;

-- Create indexes for user table
CREATE INDEX IF NOT EXISTS idx_user_email ON user(email);

-- Create session table
CREATE TABLE IF NOT EXISTS session (
    id TEXT NOT NULL PRIMARY KEY,
    expiresAt TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    ipAddress TEXT,
    userAgent TEXT,
    userId TEXT NOT NULL REFERENCES user(id)
) STRICT, WITHOUT ROWID;

-- Create indexes for session table
CREATE INDEX IF NOT EXISTS idx_session_userId ON session(userId);
CREATE INDEX IF NOT EXISTS idx_session_token ON session(token);

-- Create account table
CREATE TABLE IF NOT EXISTS account (
    id TEXT NOT NULL PRIMARY KEY,
    accountId TEXT NOT NULL,
    providerId TEXT NOT NULL,
    userId TEXT NOT NULL REFERENCES user(id),
    accessToken TEXT,
    refreshToken TEXT,
    idToken TEXT,
    accessTokenExpiresAt TEXT,
    refreshTokenExpiresAt TEXT,
    scope TEXT,
    password TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
) STRICT, WITHOUT ROWID;

-- Create indexes for account table
CREATE INDEX IF NOT EXISTS idx_account_userId ON account(userId);

-- Create verification table
CREATE TABLE IF NOT EXISTS verification (
    id TEXT NOT NULL PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expiresAt TEXT NOT NULL,
    createdAt TEXT,
    updatedAt TEXT
) STRICT, WITHOUT ROWID;

-- Create places table
CREATE TABLE IF NOT EXISTS places (
    id TEXT PRIMARY KEY,
    name1 TEXT NOT NULL,
    name2 TEXT,
    type TEXT,
    description TEXT,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    links TEXT, -- JSON Array of links
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
) STRICT, WITHOUT ROWID;

-- Create Full Text Search (FTS) index for places table for name1 and name2
CREATE VIRTUAL TABLE IF NOT EXISTS places_fts USING fts5(
    name1,
    name2,
    content='places',
    content_rowid='id'
);

-- Create places_log table
CREATE TABLE IF NOT EXISTS places_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    place_id TEXT REFERENCES places(id),
    action TEXT, -- (I, U, D)
    old_data TEXT, -- JSON
    new_data TEXT, -- JSON
    user_email TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
) STRICT, WITHOUT ROWID;

-- Create indexes for places_log table
CREATE INDEX IF NOT EXISTS idx_places_log_place_id ON places_log(place_id);
CREATE INDEX IF NOT EXISTS idx_places_log_createdAt ON places_log(createdAt);


-- Enable foreign key constraints
PRAGMA foreign_keys = ON;