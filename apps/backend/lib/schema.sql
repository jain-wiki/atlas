-- Disable foreign key constraints (temporarily for schema creation)
PRAGMA foreign_keys = OFF;

-- Create user table
CREATE TABLE IF NOT EXISTS user (
    id TEXT NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    emailVerified INTEGER NOT NULL,
    image TEXT,
    createdAt DATE NOT NULL,
    updatedAt DATE NOT NULL
);

-- Create indexes for user table
CREATE INDEX IF NOT EXISTS idx_user_email ON user(email);

-- Create session table
CREATE TABLE IF NOT EXISTS session (
    id TEXT NOT NULL PRIMARY KEY,
    expiresAt DATE NOT NULL,
    token TEXT NOT NULL UNIQUE,
    createdAt DATE NOT NULL,
    updatedAt DATE NOT NULL,
    ipAddress TEXT,
    userAgent TEXT,
    userId TEXT NOT NULL REFERENCES user(id)
);

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
    accessTokenExpiresAt DATE,
    refreshTokenExpiresAt DATE,
    scope TEXT,
    password TEXT,
    createdAt DATE NOT NULL,
    updatedAt DATE NOT NULL
);

-- Create indexes for account table
CREATE INDEX IF NOT EXISTS idx_account_userId ON account(userId);

-- Create verification table
CREATE TABLE IF NOT EXISTS verification (
    id TEXT NOT NULL PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expiresAt DATE NOT NULL,
    createdAt DATE,
    updatedAt DATE
);

-- Create places table
CREATE TABLE IF NOT EXISTS places (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    additional_names TEXT,
    type_of_place TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create places_log table
CREATE TABLE IF NOT EXISTS places_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    place_id TEXT REFERENCES places(id),
    action TEXT, -- (I, U, D)
    old_data TEXT, -- JSON
    new_data TEXT, -- JSON
    user_email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


-- Enable foreign key constraints
PRAGMA foreign_keys = ON;