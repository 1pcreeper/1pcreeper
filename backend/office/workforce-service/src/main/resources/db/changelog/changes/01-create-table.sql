CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS staff_schedule_preferences CASCADE;
DROP TABLE IF EXISTS place_occupation_rules CASCADE;
DROP TABLE IF EXISTS place_working_period_rules CASCADE;
DROP TABLE IF EXISTS place_schedule_rules CASCADE;
DROP TABLE IF EXISTS staff_occupations CASCADE;
DROP TABLE IF EXISTS occupations CASCADE;
DROP TABLE IF EXISTS staff_details CASCADE;
DROP TABLE IF EXISTS staffs CASCADE;
DROP TABLE IF EXISTS places CASCADE;
DROP TABLE IF EXISTS working_periods CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS company_details CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS person_details CASCADE;
DROP TABLE IF EXISTS persons CASCADE;
DROP TABLE IF EXISTS abstract_auditable_entity CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS abstract_persistable_entity CASCADE;

DROP TYPE IF EXISTS task_status;
DROP TYPE IF EXISTS schedule_status;
DROP TYPE IF EXISTS transaction_method;
DROP TYPE IF EXISTS work_type;
DROP TYPE IF EXISTS gender;

CREATE TYPE gender AS ENUM ('MALE', 'FEMALE');
CREATE TYPE work_type AS ENUM ('FULL_TIME', 'FULL_PART_TIME', 'PART_TIME','CONTRACT','FREELANCE');
CREATE TYPE transaction_method AS ENUM ('DEPOSIT','WITHDRAWAL','OVERWRITE','SYSTEM_UPDATE');
CREATE TYPE schedule_status AS ENUM ('ACTIVE','INACTIVE','DRAFT');
CREATE TYPE task_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

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

CREATE TABLE persons (
   id SERIAL PRIMARY KEY,
   name_english VARCHAR(255),
   name_chinese VARCHAR(255),
   office_tel VARCHAR(50) NULL CHECK (office_tel ~ '^[+]([0-9]){3}\s([0-9])+$' OR office_tel IS NULL),
   mobile_tel VARCHAR(50) NULL CHECK (mobile_tel ~ '^[+]([0-9]){3}\s([0-9])+$' OR mobile_tel IS NULL),
   email VARCHAR(255) CHECK (email <> '' AND email NOT LIKE '% %' AND email ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9._%+-]+\.[a-zA-Z]{2,}$'),
   hk_id VARCHAR(255) UNIQUE NULL CHECK (hk_id ~ '^[A-Z][0-9]{6}\([0-9]\)$' OR hk_id IS NULL),
   cn_id VARCHAR(255) UNIQUE NULL CHECK (cn_id ~ '^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|10|11|12)((0[1-9]|[12]\d|3[01]))\d{3}[\dXx]$' OR cn_id IS NULL),
   mo_id VARCHAR(255) UNIQUE NULL CHECK (mo_id ~ '^\d{8}$' OR mo_id IS NULL),
   passport_id VARCHAR(255) NULL CHECK (passport_id ~ '^[A-Z0-9]+$' OR passport_id IS NULL),
   is_active BOOLEAN DEFAULT TRUE
 ) INHERITS (abstract_auditable_entity);
 
 CREATE TABLE person_details (
    id SERIAL PRIMARY KEY,
    person_id INTEGER UNIQUE NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    bio TEXT,
    date_of_birth DATE,
    gender gender,
    nationality VARCHAR(255),
    occupation VARCHAR(255),
    address TEXT,
    wechat_id VARCHAR(50),
    instagram_id VARCHAR(50),
    website TEXT
  ) INHERITS (abstract_auditable_entity);

CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name_english VARCHAR(255),
  name_chinese VARCHAR(255),
  business_registration_number VARCHAR(50) UNIQUE NULL CHECK (business_registration_number ~ '^[0-9]{8}$' OR business_registration_number IS NULL),
  secretary_license_number VARCHAR(20) UNIQUE NULL CHECK (secretary_license_number ~ '^[0-9]{6}$' OR secretary_license_number IS NULL),
  email VARCHAR(255) NULL CHECK (email <> '' AND email NOT LIKE '% %' AND email ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9._%+-]+\.[a-zA-Z]{2,}$'),
  tel VARCHAR(50) NULL CHECK (tel ~ '^[+]([0-9]){3}\s([0-9])+$' OR tel IS NULL),
  is_active BOOLEAN DEFAULT TRUE
) INHERITS (abstract_auditable_entity);

CREATE TABLE company_details (
  id SERIAL PRIMARY KEY,
  company_id INTEGER UNIQUE NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  bio TEXT,
  address TEXT,
  industry TEXT,
  website TEXT
) INHERITS (abstract_auditable_entity);

CREATE TABLE organizations (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  bio TEXT,
  is_active BOOLEAN DEFAULT TRUE
) INHERITS (abstract_auditable_entity);

CREATE TABLE working_periods (
  id SERIAL PRIMARY KEY,
  org_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  start_at TIME NOT NULL,
  end_at TIME NOT NULL,
  name VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(org_id,start_at,end_at)
) INHERITS (abstract_auditable_entity);

CREATE TABLE places (
   id SERIAL PRIMARY KEY,
   org_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
   name TEXT NOT NULL,
   address TEXT,
   is_active BOOLEAN DEFAULT TRUE
) INHERITS (abstract_auditable_entity);

CREATE TABLE staffs (
   id SERIAL PRIMARY KEY,
   company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
   person_id INTEGER NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
   org_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
   cust_id TEXT,
   type work_type,
   is_active BOOLEAN DEFAULT TRUE,
   UNIQUE(company_id,person_id)
) INHERITS (abstract_auditable_entity);

CREATE TABLE staff_details (
   id SERIAL PRIMARY KEY,
   staff_id INTEGER NOT NULL REFERENCES staffs(id) ON DELETE CASCADE,
   max_working_hrs INTEGER NOT NULL CHECK (max_working_hrs > 0)
) INHERITS (abstract_auditable_entity);

CREATE TABLE occupations (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    org_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE
) INHERITS (abstract_auditable_entity);

CREATE TABLE staff_occupations (
    id SERIAL PRIMARY KEY,
    staff_id INTEGER NOT NULL REFERENCES staffs(id) ON DELETE CASCADE,
    occupation_id INTEGER NOT NULL REFERENCES occupations(id) ON DELETE CASCADE,
    remark TEXT,
    UNIQUE(staff_id,occupation_id)
) INHERITS (abstract_auditable_entity);

CREATE TABLE place_schedule_rules (
   id SERIAL PRIMARY KEY,
   place_id INTEGER UNIQUE NOT NULL REFERENCES places(id) ON DELETE CASCADE,
   person_count INTEGER NOT NULL CHECK (person_count > 0),
   work_type_priorities work_type[]
) INHERITS (abstract_auditable_entity);

CREATE TABLE place_working_period_rules (
   id SERIAL PRIMARY KEY,
   place_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
   working_period_id INTEGER NOT NULL REFERENCES working_periods(id) ON DELETE CASCADE,
   person_count INTEGER NOT NULL,
   UNIQUE(place_id,working_period_id)
) INHERITS (abstract_auditable_entity);

CREATE TABLE place_occupation_rules (
   id SERIAL PRIMARY KEY,
   place_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
   occupation_id INTEGER NOT NULL REFERENCES occupations(id) ON DELETE CASCADE,
   person_count INTEGER NOT NULL,
   UNIQUE(place_id,occupation_id)
) INHERITS (abstract_auditable_entity);

CREATE TABLE staff_schedule_preferences (
    id SERIAL PRIMARY KEY,
    staff_id INTEGER NOT NULL REFERENCES staffs(id) ON DELETE CASCADE,
    place_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    week_day INTEGER NOT NULL CHECK ( week_day >= 1 AND week_day <= 7),
    working_period_id INTEGER NOT NULL REFERENCES working_periods(id) ON DELETE CASCADE,
    priority_index INTEGER DEFAULT 0 CHECK (priority_index >=0),
    UNIQUE(staff_id,place_id,week_day)
) INHERITS (abstract_auditable_entity);

CREATE TABLE schedules(
   id SERIAL PRIMARY KEY,
   start_at TIMESTAMP NOT NULL,
   end_at TIMESTAMP NOT NULL,
   place_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
   staff_id INTEGER NOT NULL REFERENCES staffs(id) ON DELETE CASCADE,
   status schedule_status NOT NULL,
   remark TEXT
) INHERITS (abstract_auditable_entity);

CREATE TABLE schedule_generation_tasks (
    id SERIAL PRIMARY KEY,
    status task_status NOT NULL,
    requested_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    error_message TEXT NULL
) INHERITS (abstract_auditable_entity);