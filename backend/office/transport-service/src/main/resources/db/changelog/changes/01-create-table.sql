CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS vrd_submissions CASCADE;
DROP TABLE IF EXISTS vehicle_vrds CASCADE;
DROP TABLE IF EXISTS vehicle_details CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS abstract_auditable_entity CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS abstract_persistable_entity CASCADE;

-- Root persistable entity for optimistic locking
CREATE TABLE abstract_persistable_entity (
    id SERIAL PRIMARY KEY,
    version INTEGER
);

-- Local user mirror synchronized from account-service
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

-- Base auditable entity inherited by all domain tables
CREATE TABLE abstract_auditable_entity (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP,
    created_by INTEGER,
    updated_by INTEGER,
    FOREIGN KEY (created_by) REFERENCES "users"(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES "users"(id) ON DELETE SET NULL
) INHERITS (abstract_persistable_entity);

-- 1. Core Vehicle Registry
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    uid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    person_uid UUID NOT NULL, -- Cross-service logical link to workforce_db: persons.uid
    license_plate VARCHAR(32) NOT NULL,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year_of_manufacture INTEGER NULL CHECK (year_of_manufacture >= 1900 AND year_of_manufacture <= 2100),
    color VARCHAR(50) NULL,
    chassis_number VARCHAR(100) NULL, -- Vehicle Identification Number (VIN)
    engine_number VARCHAR(100) NULL,
    engine_capacity_cc INTEGER NULL CHECK (engine_capacity_cc > 0 OR engine_capacity_cc IS NULL),
    seating_capacity INTEGER NULL CHECK (seating_capacity > 0 OR seating_capacity IS NULL),
    fuel_type VARCHAR(50) NULL, -- PETROL, DIESEL, ELECTRIC, HYBRID
    vehicle_class VARCHAR(50) NULL, -- PRIVATE_CAR, LIGHT_GOODS_VEHICLE, MEDIUM_GOODS_VEHICLE, etc.
    vrd_expiry_date DATE NULL,
    avatar_url TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_vehicle_created_by FOREIGN KEY (created_by) REFERENCES "users"(id) ON DELETE SET NULL,
    CONSTRAINT fk_vehicle_updated_by FOREIGN KEY (updated_by) REFERENCES "users"(id) ON DELETE SET NULL
) INHERITS (abstract_auditable_entity);

-- 2. Extended Vehicle Insurance & Registration Details (1-to-1)
CREATE TABLE vehicle_details (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER UNIQUE NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    insurance_policy_number VARCHAR(100) NULL,
    insurance_company VARCHAR(150) NULL,
    insurance_expiry_date DATE NULL,
    first_registration_date DATE NULL,
    notes TEXT NULL,
    CONSTRAINT fk_veh_detail_created_by FOREIGN KEY (created_by) REFERENCES "users"(id) ON DELETE SET NULL,
    CONSTRAINT fk_veh_detail_updated_by FOREIGN KEY (updated_by) REFERENCES "users"(id) ON DELETE SET NULL
) INHERITS (abstract_auditable_entity);

-- 3. Verified Vehicle Registration Documents (VRD)
CREATE TABLE vehicle_vrds (
    id SERIAL PRIMARY KEY,
    uid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    document_number VARCHAR(100) NULL,
    registration_mark VARCHAR(50) NOT NULL,
    registered_owner_name VARCHAR(255) NULL,
    registered_owner_address TEXT NULL,
    issue_date DATE NULL,
    expiry_date DATE NOT NULL,
    file_key TEXT NOT NULL,
    sha256 CHAR(64) NOT NULL,
    byte_size BIGINT NOT NULL,
    media_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, SUPERSEDED, EXPIRED
    CONSTRAINT fk_vrd_created_by FOREIGN KEY (created_by) REFERENCES "users"(id) ON DELETE SET NULL,
    CONSTRAINT fk_vrd_updated_by FOREIGN KEY (updated_by) REFERENCES "users"(id) ON DELETE SET NULL
) INHERITS (abstract_auditable_entity);

-- 4. Uploaded VRD Submissions (OCR & Approval Queue)
CREATE TABLE vrd_submissions (
    id SERIAL PRIMARY KEY,
    uid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    file_key TEXT NOT NULL,
    sha256 CHAR(64) NOT NULL,
    byte_size BIGINT NOT NULL,
    media_type VARCHAR(100) NOT NULL,
    ocr_raw_data JSONB NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, DECLINED
    reviewed_by INTEGER NULL REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP NULL,
    decline_reason TEXT NULL,
    CONSTRAINT fk_vrd_sub_created_by FOREIGN KEY (created_by) REFERENCES "users"(id) ON DELETE SET NULL,
    CONSTRAINT fk_vrd_sub_updated_by FOREIGN KEY (updated_by) REFERENCES "users"(id) ON DELETE SET NULL
) INHERITS (abstract_auditable_entity);
