-- Fix NextAuth tables to use camelCase column names to match DrizzleAdapter expectations

-- Drop existing auth tables (they will be recreated with correct schema)
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS verification_tokens CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Recreate users table with camelCase columns
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL UNIQUE,
  emailVerified TIMESTAMP,
  image TEXT
);

-- Recreate accounts table with camelCase columns
CREATE TABLE accounts (
  userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  providerAccountId TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  PRIMARY KEY (provider, providerAccountId)
);

-- Recreate sessions table with camelCase columns
CREATE TABLE sessions (
  sessionToken TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMP NOT NULL
);

-- Recreate verification_tokens table with camelCase columns
CREATE TABLE verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires TIMESTAMP NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- Create indexes for better performance
CREATE INDEX accounts_userId_idx ON accounts(userId);
CREATE INDEX sessions_userId_idx ON sessions(userId);
