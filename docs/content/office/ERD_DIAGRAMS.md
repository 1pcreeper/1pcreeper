# Office Enterprise System — Entity Relationship Diagrams

## 1. Auditing Foundation Inheritance Model

Every concrete entity across all office databases inherits auditing columns from `abstract_auditable_entity`:

```mermaid
erDiagram
    users ||--o{ abstract_auditable_entity : creates_or_updates
    abstract_persistable_entity ||--o{ abstract_auditable_entity : inherits
    abstract_auditable_entity ||--o{ concrete_table : inherits

    abstract_persistable_entity {
        integer id PK
        integer version
    }

    users {
        integer id PK
        string uid UK
        timestamp created_at
        timestamp updated_at
    }

    user_roles {
        integer user_id FK
        string role
    }

    abstract_auditable_entity {
        integer id PK
        timestamp created_at
        timestamp updated_at
        integer created_by FK
        integer updated_by FK
    }

    concrete_table {
        integer id PK
        uuid uid UK
        integer version
        timestamp created_at
        timestamp updated_at
        integer created_by FK
        integer updated_by FK
    }
```

---

## 2. Workforce Service Schema (`office_workforce_db`)

```mermaid
erDiagram
    companies ||--o{ departments : contains
    companies ||--o{ company_details : has
    organizations ||--o{ organization_details : has
    companies ||--o{ occupations : defines
    companies ||--o{ places : operates
    companies ||--o{ working_periods : schedules
    companies ||--o{ staffs : employs
    persons ||--o{ person_details : has
    persons ||--o{ staffs : assigned_as
    staffs ||--o{ staff_details : has
    staffs ||--o{ staff_occupations : assigned
    occupations ||--o{ staff_occupations : assigned_to
    staffs ||--o{ schedules : works
    places ||--o{ schedules : occurs_at
    working_periods ||--o{ schedules : during

    persons {
        integer id PK
        uuid uid UK
        string name_english
        string name_chinese
        string office_tel
        string mobile_tel
        string email
        string hk_id UK
        string cn_id UK
        string mo_id UK
        string passport_id
        boolean is_active
    }

    person_details {
        integer id PK
        integer person_id FK
        string bio
        date date_of_birth
        string gender
        string nationality
        string occupation
        string address
        string wechat_id
        string instagram_id
        string website
    }

    companies {
        integer id PK
        uuid uid UK
        string name_english
        string name_chinese
        string business_registration_number UK
        string secretary_license_number UK
        string email
        string tel
        boolean is_active
    }

    company_details {
        integer id PK
        integer company_id FK
        string bio
        string address
        string industry
        string website
    }

    organization_details {
        integer id PK
        integer org_id FK
        string bio
        string address
        string industry
        string website
    }

    departments {
        integer id PK
        uuid uid UK
        integer company_id FK
        string name
        string bio
        boolean is_active
    }

    occupations {
        integer id PK
        uuid uid UK
        integer company_id FK
        string name
        string bio
        boolean is_active
    }

    staffs {
        integer id PK
        uuid uid UK
        integer company_id FK
        integer person_id FK
        string code
        boolean is_active
    }

    staff_details {
        integer id PK
        integer staff_id FK
        integer department_id FK
        string work_type
        date hired_at
        date terminated_at
    }

    places {
        integer id PK
        uuid uid UK
        integer company_id FK
        string name
        string address
        boolean is_active
    }

    working_periods {
        integer id PK
        integer company_id FK
        time start_time
        time end_time
        integer break_duration
    }

    schedules {
        integer id PK
        integer company_id FK
        integer staff_id FK
        integer place_id FK
        integer working_period_id FK
        date work_date
        string status
    }
```

---

## 3. Transport Service Schema (`office_transport_db`)

```mermaid
erDiagram
    vehicles ||--o{ vehicle_details : has
    vehicles ||--o{ vehicle_vrds : verifies
    vehicles ||--o{ vrd_submissions : uploads

    vehicles {
        integer id PK
        uuid uid UK
        uuid person_uid "Logical Link to workforce persons.uid"
        string license_plate UK
        string make
        string model
        integer year_of_manufacture
        string color
        string chassis_number
        string engine_number
        integer engine_capacity_cc
        integer seating_capacity
        string fuel_type
        string vehicle_class
        date vrd_expiry_date
        string avatar_url
        boolean is_active
    }

    vehicle_details {
        integer id PK
        integer vehicle_id FK
        string insurance_policy_number
        string insurance_company
        date insurance_expiry_date
        date first_registration_date
        string notes
    }

    vehicle_vrds {
        integer id PK
        uuid uid UK
        integer vehicle_id FK
        string document_number
        string registration_mark
        string registered_owner_name
        string registered_owner_address
        date issue_date
        date expiry_date
        string file_key
        string sha256
        bigint byte_size
        string media_type
        string status
    }

    vrd_submissions {
        integer id PK
        uuid uid UK
        integer vehicle_id FK
        string file_key
        string sha256
        bigint byte_size
        string media_type
        jsonb ocr_raw_data
        string status
        integer reviewed_by FK
        timestamp reviewed_at
        string decline_reason
    }
```

> **Note on Document Explorer**:
> Vehicle attachments and folder explorer files are **not stored in `office_transport_db`**. They are managed as a **pure file system** at `/data/local/office/transport-service/vehicles/{vehicleUid}/explorer`. If files disappear or are renamed on disk, exceptions are ignored gracefully and marked with warning signals.

---

## 4. Cross-Service Boundaries & gRPC Linking

```mermaid
flowchart LR
    subgraph Workforce_Service_DB["office_workforce_db"]
        PersonEntity["persons<br/><b>uid (UUID)</b><br/>name_english<br/>name_chinese<br/>hk_id<br/>mobile_tel"]
    end

    subgraph Transport_Service_DB["office_transport_db"]
        VehicleEntity["vehicles<br/>id (SERIAL)<br/>uid (UUID)<br/><b>person_uid (UUID)</b><br/>license_plate<br/>make / model"]
        VrdEntity["vehicle_vrds<br/>vehicle_id (FK)<br/>expiry_date"]
    end

    VehicleEntity -. "gRPC Query: getPersonByUid(person_uid)" .-> PersonEntity
    VehicleEntity --> VrdEntity
```

- **Zero Cross-DB Foreign Keys**: Database engines are decoupled.
- **Resilient gRPC Lookup**: `transport-service` resolves owner data over authenticated gRPC with cached lookups.
