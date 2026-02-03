@echo off
REM Create database and tables for rippa-polska
REM Prerequisites: PostgreSQL must be installed and running

echo Creating database rippa_polska...
psql -U sales_user -h localhost -c "CREATE DATABASE rippa_polska;"

echo Creating tables...
psql -U sales_user -h localhost -d rippa_polska -c "
CREATE TABLE IF NOT EXISTS \"User\" (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  \"emailVerified\" TIMESTAMP,
  password VARCHAR(255),
  image VARCHAR(255),
  \"createdAt\" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \"updatedAt\" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS \"Model\" (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  power VARCHAR(255) NOT NULL,
  depth VARCHAR(255) NOT NULL,
  weight VARCHAR(255) NOT NULL,
  bucket VARCHAR(255) NOT NULL,
  price VARCHAR(255) NOT NULL,
  featured BOOLEAN DEFAULT false,
  \"adminId\" VARCHAR(255) NOT NULL REFERENCES \"User\"(id) ON DELETE CASCADE,
  \"createdAt\" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \"updatedAt\" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS \"Image\" (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  url VARCHAR(255) NOT NULL,
  alt VARCHAR(255),
  \"modelId\" VARCHAR(255) NOT NULL REFERENCES \"Model\"(id) ON DELETE CASCADE,
  \"createdAt\" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS \"Account\" (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  \"userId\" VARCHAR(255) NOT NULL REFERENCES \"User\"(id) ON DELETE CASCADE,
  type VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  \"providerAccountId\" VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type VARCHAR(255),
  scope TEXT,
  id_token TEXT,
  session_state VARCHAR(255),
  UNIQUE(provider, \"providerAccountId\")
);

CREATE TABLE IF NOT EXISTS \"Session\" (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  \"sessionToken\" VARCHAR(255) UNIQUE NOT NULL,
  \"userId\" VARCHAR(255) NOT NULL REFERENCES \"User\"(id) ON DELETE CASCADE,
  expires TIMESTAMP NOT NULL
);
"

echo Database and tables created successfully!
pause
