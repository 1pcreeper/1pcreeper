CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS abstract_auditable_entity CASCADE;
DROP TABLE IF EXISTS abstract_persistable_entity CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  uid VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(20) UNIQUE CHECK (name <> '' AND name NOT LIKE '% %' AND name ~ '^[a-zA-Z0-9._]+$'),
  email VARCHAR(255) UNIQUE CHECK (email <> '' AND email NOT LIKE '% %' AND email ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9._%+-]+\.[a-zA-Z]{2,}$'),
  display_name VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL
);

CREATE TABLE abstract_persistable_entity (
    id SERIAL PRIMARY KEY,
    version INTEGER
);

CREATE TABLE abstract_auditable_entity (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP,
  created_by INTEGER ,
  updated_by INTEGER ,
  FOREIGN KEY (created_by) REFERENCES "users"(id) ON DELETE CASCADE,
  FOREIGN KEY (updated_by) REFERENCES "users"(id) ON DELETE CASCADE
) INHERITS (abstract_persistable_entity);
