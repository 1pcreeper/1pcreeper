CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS outcome_expenses CASCADE;
DROP TABLE IF EXISTS staff_salaries CASCADE;
DROP TABLE IF EXISTS outcomes CASCADE;
DROP TABLE IF EXISTS outcome_subcategories CASCADE;
DROP TABLE IF EXISTS outcome_categories CASCADE;
DROP TABLE IF EXISTS abstract_auditable_entity CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS abstract_persistable_entity CASCADE;

DROP TYPE IF EXISTS interval_period;

CREATE TYPE interval_period AS ENUM ('DAILY', 'MONTHLY','YEARLY');

CREATE TABLE abstract_persistable_entity (
    id SERIAL PRIMARY KEY,
    version INTEGER
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  uid VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL
) INHERITS (abstract_persistable_entity);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL
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

CREATE TABLE outcome_categories (
	id SERIAL PRIMARY KEY,
	name TEXT NOT NULL,
	is_active BOOLEAN DEFAULT TRUE,
	company_id INTEGER NOT NULL   -- referenced to office_workforce_db companies(id)
) INHERITS (abstract_auditable_entity);

CREATE TABLE outcome_subcategories (
	id SERIAL PRIMARY KEY,
	name TEXT NOT NULL,
	category_id INTEGER NOT NULL REFERENCES outcome_categories(id) ON DELETE CASCADE,
	is_active BOOLEAN DEFAULT TRUE,
	company_id INTEGER NOT NULL  -- referenced to office_workforce_db companies(id)
) INHERITS (abstract_auditable_entity);

CREATE TABLE outcomes (
	id SERIAL PRIMARY KEY,
	name TEXT NOT NULL,
	subcategory_id INTEGER NOT NULL REFERENCES outcome_subcategories(id) ON DELETE CASCADE,
	default_price NUMERIC(12, 4) NOT NULL,
	is_active BOOLEAN DEFAULT TRUE,
	company_id INTEGER NOT NULL  -- referenced to office_workforce_db companies(id)
) INHERITS (abstract_auditable_entity);

CREATE TABLE staff_salaries (
	id SERIAL PRIMARY KEY,
	staff_id INTEGER NOT NULL,  -- referenced to office_workforce_db staffs(id)
	amount NUMERIC(12, 4) NOT NULL,
	approved_at TIMESTAMP NOT NULL,
	is_active BOOLEAN DEFAULT TRUE,
	UNIQUE(staff_id,approved_at)
) INHERITS (abstract_auditable_entity);

CREATE TABLE outcome_expenses (
	id SERIAL PRIMARY KEY,
	name TEXT NOT NULL,
	outcome_id INTEGER REFERENCES outcomes(id) ON DELETE CASCADE,
	cost NUMERIC(12, 4) NOT NULL,
	period interval_period NOT NULL,
	invoked_at TIMESTAMP NOT NULL,
	started_at TIMESTAMP,
	ended_at TIMESTAMP,
	is_active BOOLEAN DEFAULT TRUE,
	company_id INTEGER NOT NULL  -- referenced to office_workforce_db companies(id)
) INHERITS (abstract_auditable_entity);

CREATE TABLE staff_salary_expenses (
	id SERIAL PRIMARY KEY,
	name TEXT NOT NULL,
	staff_salary_id INTEGER NOT NULL REFERENCES staff_salaries(id) ON DELETE CASCADE,
	cost NUMERIC(12, 4) NOT NULL,
	period interval_period NOT NULL,
	invoked_at TIMESTAMP NOT NULL,
	started_at TIMESTAMP,
	ended_at TIMESTAMP,
	is_active BOOLEAN DEFAULT TRUE,
	company_id INTEGER NOT NULL  -- referenced to office_workforce_db companies(id)
) INHERITS (abstract_auditable_entity);
