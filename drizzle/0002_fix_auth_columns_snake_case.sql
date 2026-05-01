-- Fix NextAuth tables to use snake_case column names to match DrizzleAdapter expectations

-- Drop existing auth tables (they will be recreated with correct schema)
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS verification_tokens CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Recreate users table with snake_case columns
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL UNIQUE,
  email_verified TIMESTAMP,
  image TEXT
);

-- Recreate accounts table with snake_case columns
CREATE TABLE accounts (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  PRIMARY KEY (provider, provider_account_id)
);

-- Recreate sessions table with snake_case columns
CREATE TABLE sessions (
  session_token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMP NOT NULL
);

-- Recreate verification_tokens table with snake_case columns
CREATE TABLE verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires TIMESTAMP NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- Create indexes for better performance
CREATE INDEX accounts_user_id_idx ON accounts(user_id);
CREATE INDEX sessions_user_id_idx ON sessions(user_id);
