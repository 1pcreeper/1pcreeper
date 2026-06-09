CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS project_shares CASCADE;
DROP TABLE IF EXISTS project_objects CASCADE;
DROP TABLE IF EXISTS project_resources CASCADE;
DROP TABLE IF EXISTS obj_projects CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS abstract_auditable_entity CASCADE;
DROP TABLE IF EXISTS abstract_persistable_entity CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS project_status CASCADE;
DROP TYPE IF EXISTS resource_type CASCADE;
DROP TYPE IF EXISTS source_type CASCADE;
DROP TYPE IF EXISTS access_level CASCADE;


CREATE TYPE project_status AS ENUM ('PENDING', 'PROCESSING', 'READY', 'FAILED');
CREATE TYPE resource_type AS ENUM ('REFERENCE_IMAGE', 'CUSTOM_TEXTURE', 'TEXT_PROMPT');
CREATE TYPE source_type AS ENUM ('AI_GENERATED', 'USER_UPLOADED', 'SYSTEM_PRIMITIVE');
CREATE TYPE access_level AS ENUM ('VIEWER', 'EDITOR');


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
  created_by INTEGER,
  updated_by INTEGER,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE CASCADE
) INHERITS (abstract_persistable_entity);


CREATE TABLE obj_projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    prompt TEXT,
    status project_status DEFAULT 'PENDING', 
    parent_project_id INTEGER DEFAULT NULL,
    FOREIGN KEY (parent_project_id) REFERENCES obj_projects(id) ON DELETE SET NULL
) INHERITS (abstract_auditable_entity);

CREATE TABLE project_resources (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    resource_type resource_type NOT NULL,
    minio_url TEXT NOT NULL, 
    file_name VARCHAR(255),
    FOREIGN KEY (project_id) REFERENCES obj_projects(id) ON DELETE CASCADE
) INHERITS (abstract_auditable_entity);

CREATE TABLE project_objects (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    object_name VARCHAR(255) NOT NULL, 
    source_type source_type NOT NULL, 
    raw_obj_url TEXT,                   
    view_glb_url TEXT,                  
    editor_state JSONB DEFAULT '{"position": [0,0,0], "rotation": [0,0,0], "scale": [1,1,1], "materials": {}}'::jsonb,
    FOREIGN KEY (project_id) REFERENCES obj_projects(id) ON DELETE CASCADE
) INHERITS (abstract_auditable_entity);

CREATE TABLE project_shares (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    access_level access_level NOT NULL,
    UNIQUE (project_id, user_id),
    FOREIGN KEY (project_id) REFERENCES obj_projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) INHERITS (abstract_auditable_entity);
