# Office Enterprise System — Database & Liquibase Specification

## 1. Auditing Foundation & Inheritance Rules

Every database within the office microservices (`office_account_db`, `office_workforce_db`, `office_transport_db`, `office_expenditure_db`) implements PostgreSQL Table Inheritance.

### Mandatory Rules
1. **Inheritance Requirement**: Every new table **must inherit `abstract_auditable_entity`** (`INHERITS (abstract_auditable_entity)`).
2. **Preservation of Existing Schemas**: Do not edit the structure and fields of existing tables, except `uid` (`UUID UNIQUE DEFAULT gen_random_uuid()`).
3. **No Cross-Database Foreign Keys**: References across service databases (such as `transport-service` referencing a person from `workforce-service`) **must use `uid UUID`**, never an SQL `FOREIGN KEY`.
4. **Explicit Child Constraint Redeclaration**: Because PostgreSQL table inheritance does not inherit primary keys, unique constraints, or foreign keys, every child table must redeclare:
   - `id SERIAL PRIMARY KEY`
   - `uid UUID UNIQUE DEFAULT gen_random_uuid()`
   - Foreign key constraints for `created_by` and `updated_by` referencing the local `users(id)` table.

---

## 2. Infrastructure Tables (Existing Across All Databases)

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Root entity with optimistic locking
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
    FOREIGN KEY (created_by) REFERENCES "users"(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES "users"(id) ON DELETE CASCADE
) INHERITS (abstract_persistable_entity);
```

---

## 3. Existing Workforce Service Tables (`office_workforce_db`)

The existing schema in `office-workforce-service` remains untouched, maintaining strict regex constraints and the Core + Detail split:

### Core Enums
```sql
CREATE TYPE gender AS ENUM ('MALE', 'FEMALE');
CREATE TYPE work_type AS ENUM ('FULL_TIME', 'FULL_PART_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERN', 'TEMPORARY', 'SPECIAL');
CREATE TYPE transaction_method AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'OVERWRITE', 'SYSTEM_UPDATE');
CREATE TYPE schedule_status AS ENUM ('ACTIVE', 'INACTIVE', 'DRAFT');
CREATE TYPE task_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');
```

### Table Dictionary (Summary)
- **`persons`**:
  `id`, `uid UUID DEFAULT gen_random_uuid()`, `name_english`, `name_chinese`, `office_tel`, `mobile_tel`, `email`, `hk_id`, `cn_id`, `mo_id`, `passport_id`, `is_active`.
- **`person_details`**:
  `id`, `person_id INTEGER UNIQUE FK`, `bio`, `date_of_birth`, `gender`, `nationality`, `occupation`, `address`, `wechat_id`, `instagram_id`, `website`.
- **`companies`**:
  `id`, `uid UUID DEFAULT gen_random_uuid()`, `name_english`, `name_chinese`, `business_registration_number`, `secretary_license_number`, `email`, `tel`, `is_active`.
- **`company_details`**:
  `id`, `company_id INTEGER UNIQUE FK`, `bio`, `address`, `industry`, `website`.
- **`organization_details`**:
  `id`, `org_id INTEGER UNIQUE FK`, `bio`, `address`, `industry`, `website`.
- **`departments`**:
  `id`, `uid UUID DEFAULT gen_random_uuid()`, `company_id INTEGER FK`, `name`, `bio`, `is_active`.
- **`occupations`**:
  `id`, `uid UUID DEFAULT gen_random_uuid()`, `company_id INTEGER FK`, `name`, `bio`, `is_active`.
- **`staffs`**:
  `id`, `uid UUID DEFAULT gen_random_uuid()`, `company_id INTEGER FK`, `person_id INTEGER FK`, `code`, `is_active`.
- **`staff_details`**:
  `id`, `staff_id INTEGER UNIQUE FK`, `department_id INTEGER FK`, `work_type`, `hired_at`, `terminated_at`.
- **`staff_occupations`**:
  `id`, `staff_id INTEGER FK`, `occupation_id INTEGER FK`, `is_active`.
- **`places`**:
  `id`, `uid UUID DEFAULT gen_random_uuid()`, `company_id INTEGER FK`, `name`, `address`, `is_active`.
- **`working_periods`**:
  `id`, `company_id INTEGER FK`, `start_time TIME`, `end_time TIME`, `break_duration INTEGER`.
- **`schedules`**:
  `id`, `company_id INTEGER FK`, `staff_id INTEGER FK`, `place_id INTEGER FK`, `working_period_id INTEGER FK`, `work_date DATE`, `status schedule_status`.
- **`place_schedule_rules`**:
  `id`, `place_id INTEGER UNIQUE FK`, `person_count INTEGER`, `work_type_priorities work_type[]`.
- **`place_schedule_rule_work_types`**:
  `rule_id INTEGER FK`, `work_type VARCHAR(50)`.
- **`place_working_period_rules`**:
  `id`, `place_id INTEGER FK`, `working_period_id INTEGER FK`, `person_count INTEGER`.
- **`place_occupation_rules`**:
  `id`, `place_id INTEGER FK`, `occupation_id INTEGER FK`, `person_count INTEGER`.
- **`staff_schedule_preferences`**:
  `id`, `staff_id INTEGER FK`, `place_id INTEGER FK`, `working_period_id INTEGER FK`, `week_day INTEGER`, `priority_index INTEGER`.
- **`schedule_generation_tasks`**:
  `id`, `company_id INTEGER FK`, `target_month DATE`, `status task_status`, `error_message TEXT`.

---

## 4. Planned Transport Service Tables (`office_transport_db`)

All planned tables below **must inherit `abstract_auditable_entity`**.

### 1. `vehicles`
Core vehicle registry record. Linked logically to a Person via `person_uid`.

```sql
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    uid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    person_uid UUID NOT NULL, -- Logical link to workforce_db: persons.uid
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
    vehicle_class VARCHAR(50) NULL, -- PRIVATE_CAR, LIGHT_GOODS_VEHICLE, etc.
    vrd_expiry_date DATE NULL,
    avatar_url TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_vehicle_created_by FOREIGN KEY (created_by) REFERENCES "users"(id) ON DELETE SET NULL,
    CONSTRAINT fk_vehicle_updated_by FOREIGN KEY (updated_by) REFERENCES "users"(id) ON DELETE SET NULL
) INHERITS (abstract_auditable_entity);

CREATE UNIQUE INDEX idx_vehicles_license_plate ON vehicles (LOWER(license_plate)) WHERE is_active = TRUE;
CREATE INDEX idx_vehicles_person_uid ON vehicles (person_uid);
CREATE INDEX idx_vehicles_vrd_expiry ON vehicles (vrd_expiry_date) WHERE is_active = TRUE;
```

### 2. `vehicle_details`
1-to-1 detail entity holding extended vehicle insurance and registration metadata.

```sql
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
```

### 3. `vehicle_vrds`
Active and archived Vehicle Registration Documents (VRD) verified for the vehicle.

```sql
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

CREATE INDEX idx_vehicle_vrds_vehicle_id ON vehicle_vrds (vehicle_id);
CREATE INDEX idx_vehicle_vrds_expiry ON vehicle_vrds (expiry_date);
```

### 4. `vrd_submissions`
Uploads awaiting OCR validation and administrator review in the Approval Queue.

```sql
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

CREATE INDEX idx_vrd_submissions_status ON vrd_submissions (status);
CREATE INDEX idx_vrd_submissions_vehicle ON vrd_submissions (vehicle_id);
```

### 5. Document Explorer: Pure File System (Zero Database Persistence)

> **Architectural Specification**:
> MinIO has been eliminated. The vehicle document explorer operates as a **pure local file system** rooted at:
> `/data/local/office/transport-service/vehicles/{vehicleUid}/explorer`
>
> - **No Database Table**: Files and folder paths are **NOT** recorded in any database table (the legacy `vehicle_files` table is discarded).
> - **Direct Disk Reflection**: Directory hierarchy, nested folders, and uploads reflect 1:1 on disk via Java NIO.
> - **Exception Resilience**: If folders or files are renamed or removed externally on the filesystem, backend queries gracefully catch `NoSuchFileException`, ignore the error without crashing, and return a warning signal (`isAccessible: false`, `warningSignal: "FILE_NOT_FOUND"`) to the frontend.

---

## 5. Liquibase Changelog Organization

In `backend/office/transport-service/src/main/resources/db/changelog/`:
- `db.changelog-master.yaml`:
  - `include: file: db/changelog/changes/01-create-table.sql`
  - `include: file: db/changelog/changes/02-create-index.sql`
  - `include: file: db/changelog/changes/03-mock-data.sql`

All database migrations follow strict forward-only, append-only changesets to preserve staging and production integrity.
