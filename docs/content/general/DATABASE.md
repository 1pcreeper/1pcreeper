# PostgreSQL / Liquibase database plan

**Design only. No existing SQL, table, changelog, Maven module or database was changed.** Create separate `game_db` and `mesh_db` when their services are copied from `backend/general/dummy-service`. Do not share repositories or make cross-database foreign keys. Global account/Firebase roles remain owned by the existing account service. Session management remains with existing Spring Security.

## Auditing and identity rule for every new table

Every new concrete table listed below, including association, revision and outbox tables, must use `INHERITS (abstract_auditable_entity)` in SQL and extend the service-local `AbstractAuditableEntity` in Java. Existing `users`, `user_roles`, `abstract_persistable_entity` and `abstract_auditable_entity` are template infrastructure, not proposed replacement tables. Keep local `users` mirrors to satisfy auditing and resolve their Firebase UIDs through the current sync pattern.

The inspected template uses integer/SERIAL for `id` and integer for `version`; retain compatible SQL types when inheriting. Do not redeclare an inherited integer column as bigint. Java currently uses Long. Numeric service-owned IDs are serialized as decimal strings in browser mesh/space routes; UUIDs remain stable internal/gRPC identities. Never treat a service-local sequence as globally meaningful. Firebase UIDs remain strings, since they are not constrained to UUID format.

PostgreSQL does not inherit primary keys, unique constraints or foreign keys. Explicitly define them on **every** new child table, including `created_by` and `updated_by`; inheritance of column names is insufficient. Avoid querying the abstract parent in business repositories. [PostgreSQL inheritance documentation](https://www.postgresql.org/docs/current/ddl-inherit.html).

All tables below include these columns even when omitted in small ER diagrams:

| Column | Type | Purpose |
|---|---|---|
| `id` | `integer primary key` | Local identity; match the inherited SERIAL/integer base. Redeclare child PK and sequence. |
| `uid` | `uuid not null unique` | Stable cross-service identifier for every new concrete table; gen_random_uuid(). |
| `version` | `integer` | Inherited JPA optimistic-lock column; not the business publication revision. |
| `created_at` | `timestamp` | Inherited creation timestamp, treated consistently as UTC. |
| `updated_at` | `timestamp` | Inherited last modification time. |
| `created_by` | `integer FK` | Inherited column; explicitly redeclare its FK to local users(id) on each child. |
| `updated_by` | `integer FK` | Inherited column; explicitly redeclare its FK to local users(id) on each child. |

## Native enum types

Create native enum types through new Liquibase changesets, not free-form VARCHAR substitutes. Types must exist in each owning database independently. Java uses enums with Hibernate named-enum mapping; follow the repository's enum classes and map PostgreSQL types explicitly. Add enum values through later changesets; never edit a previously deployed changeset. [PostgreSQL enum documentation](https://www.postgresql.org/docs/current/datatype-enum.html).

```sql
CREATE TYPE merchant_status AS ENUM ('PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED');
CREATE TYPE application_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE merchant_role AS ENUM ('OWNER', 'EDITOR');
CREATE TYPE space_kind AS ENUM ('MAP', 'SPOT', 'PLACE');
CREATE TYPE publication_status AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE scene_object_kind AS ENUM ('MESH', 'PRIMITIVE', 'LIGHT', 'GROUND', 'BARRIER');
CREATE TYPE scene_interaction_type AS ENUM ('NONE', 'PRODUCT', 'TELEPORT');
CREATE TYPE scene_edit_operation_type AS ENUM ('UPSERT', 'DELETE');
CREATE TYPE product_preview_status AS ENUM ('ACTIVE', 'HIDDEN');
CREATE TYPE mesh_category AS ENUM ('FURNITURE', 'LIGHTING', 'ARCHITECTURE', 'DECORATION', 'OTHER');
CREATE TYPE mesh_source_type AS ENUM ('OBJ', 'PROCEDURAL');
CREATE TYPE mesh_version_status AS ENUM ('STAGED', 'VALIDATED', 'PUBLISHED', 'FAILED');
CREATE TYPE domain_event_type AS ENUM ('SCENE_PUBLISHED', 'MESH_PUBLISHED', 'MERCHANT_APPROVED', 'ASSET_RETIRED');
CREATE TYPE outbox_status AS ENUM ('PENDING', 'SENT', 'FAILED');
```

`publication_status`, `domain_event_type`, and `outbox_status` are needed in both databases. Merchant/space/product enums belong only to game; source/category/version enums belong only to mesh. Global ADMIN/STAFF/MERCHANT grants continue to use the account service's existing authoritative role representation; merchant memberships are business-scoped grants, not a new authentication system.

## Concrete table dictionaries

### 1. People, roles and merchant approval (game_db)

#### `merchant_profiles`

A merchant identity and its public studio profile. Includes all common auditable columns above and **inherits `abstract_auditable_entity`**.

| Column | Type | Purpose |
|---|---|---|
| `account_uid` | `varchar(255)` | Authoritative Firebase/account UID; cross-service logical reference. |
| `name` | `varchar(120)` | Public merchant display name. |
| `email` | `varchar(255)` | Contact email; staff-only unless explicitly public. |
| `category` | `varchar(80)` | Merchant discovery category. |
| `status` | `merchant_status` | PENDING, APPROVED, SUSPENDED or REJECTED. |
| `approved_at` | `timestamp` | When an administrator approved the profile; nullable until approval. |

#### `merchant_applications`

An auditable application and its review outcome. Includes all common auditable columns above and **inherits `abstract_auditable_entity`**.

| Column | Type | Purpose |
|---|---|---|
| `merchant_id` | `integer FK` | Local merchant_profiles.id. |
| `status` | `application_status` | PENDING, APPROVED or REJECTED. |
| `submitted_at` | `timestamp` | Submission instant. |
| `reviewed_at` | `timestamp` | Review completion instant; nullable. |
| `reviewed_by` | `integer FK` | Local users.id for the reviewer. |
| `review_note` | `text` | Staff explanation; never included in public DTOs. |

#### `merchant_memberships`

A merchant-scoped business role, separate from global account roles. Includes all common auditable columns above and **inherits `abstract_auditable_entity`**.

| Column | Type | Purpose |
|---|---|---|
| `merchant_id` | `integer FK` | Local merchant_profiles.id. |
| `account_uid` | `varchar(255)` | Member identity resolved through account service. |
| `role` | `merchant_role` | OWNER or EDITOR within this merchant. |
| `active` | `boolean` | Whether this membership currently grants access. |

### 2. Maps, merchant spots and interior places (game_db)

#### `game_spaces`

One typed dimension: outer map, merchant spot, or interior room. Includes all common auditable columns above and **inherits `abstract_auditable_entity`**.

| Column | Type | Purpose |
|---|---|---|
| `kind` | `space_kind` | MAP, SPOT or PLACE; corresponds to browser maps/spots/places. |
| `parent_space_id` | `integer FK` | Self-reference. Null for maps; spot parent is map; place parent is spot/place. |
| `merchant_id` | `integer FK` | Owning merchant_profiles.id; nullable only for system-owned maps. |
| `name` | `varchar(120)` | Visible space title. |
| `description` | `text` | Introduction and editorial metadata. |
| `longitude` | `numeric(9,6)` | WGS84 longitude of map origin or spot anchor, -180..180. |
| `latitude` | `numeric(8,6)` | WGS84 latitude, -90..90. |
| `status` | `publication_status` | DRAFT, PUBLISHED or ARCHIVED. |
| `published_revision_id` | `integer FK` | Nullable pointer to a complete immutable scene revision. |
| `draft_revision_id` | `integer FK` | Nullable pointer to the current editable revision. |

### 3. Scene revisions and independent mesh instances (game_db)

#### `scene_revisions`

An atomic draft/published snapshot of one space. Includes all common auditable columns above and **inherits `abstract_auditable_entity`**.

| Column | Type | Purpose |
|---|---|---|
| `space_id` | `integer FK` | Owning game_spaces.id. |
| `revision_number` | `integer` | Business publication sequence, unique per space. |
| `draft_generation` | `integer` | Optimistic generation incremented on each draft save; API draftRevision. |
| `base_revision_id` | `integer FK` | Published revision from which edits began; supports stale-write checks. |
| `status` | `publication_status` | DRAFT or PUBLISHED; published revisions are immutable. |
| `message` | `text` | Optional commit note. |
| `published_at` | `timestamp` | Publication time; null for draft. |

#### `scene_objects`

Independent placement of geometry or scene infrastructure within one revision. Includes all common auditable columns above and **inherits `abstract_auditable_entity`**.

| Column | Type | Purpose |
|---|---|---|
| `revision_id` | `integer FK` | Owning scene_revisions.id. |
| `instance_uid` | `uuid` | Stable identity of the object across revisions; unique within a revision. |
| `kind` | `scene_object_kind` | MESH, PRIMITIVE, LIGHT, GROUND or BARRIER; independent of behavior. |
| `name` | `varchar(120)` | Hierarchy label. |
| `mesh_uid` | `uuid` | Logical mesh-service asset UID; nullable for primitives/infrastructure. |
| `mesh_version_uid` | `uuid` | Exact committed mesh version pinned for reproducible publication. |
| `interaction_type` | `scene_interaction_type` | NONE, PRODUCT or TELEPORT; belongs to this placed instance only. |
| `product_preview_id` | `integer FK` | Required only for PRODUCT; null otherwise. |
| `position_x / y / z` | `double precision` | Local translation in metres, finite. |
| `rotation_x / y / z` | `double precision` | Euler XYZ rotation in radians, finite. |
| `scale_x / y / z` | `double precision` | Positive finite scale, defaults 1. |
| `visible` | `boolean` | Whether the instance is rendered. |
| `material_overrides` | `jsonb` | Validated per-instance material parameters/texture-version UIDs. |
| `properties` | `jsonb` | Typed kind-specific payload: primitive type/color, light intensity, collider dimensions, geo anchor. |
| `chunk_x / chunk_z` | `integer` | Anchor cell floor(local position / 24), for every space kind. |
| `bounds_min_x / max_x / min_z / max_z` | `double precision` | Transformed bounds used for overlap queries so large meshes are not clipped at cell edges. |

#### `portal_links`

A TELEPORT interaction from any placed instance to a target space. Geometry does not determine behavior. Includes all common auditable columns above and **inherits `abstract_auditable_entity`**.

| Column | Type | Purpose |
|---|---|---|
| `source_object_id` | `integer FK` | Unique scene_objects.id whose interaction_type is TELEPORT. |
| `target_space_id` | `integer FK` | Destination game_spaces.id. |
| `spawn_x / y / z` | `double precision` | Required destination foot position in local metres; finite. |
| `spawn_yaw` | `double precision` | Arrival facing in radians; preserve the visitor’s selected camera mode. |
| `label` | `varchar(120)` | Visible destination label. |

#### `product_previews`

Read-only product descriptions/prices used by clickable meshes in this stage. Includes all common auditable columns above and **inherits `abstract_auditable_entity`**.

| Column | Type | Purpose |
|---|---|---|
| `merchant_id` | `integer FK` | Product owner; must match scene ownership unless explicitly shared. |
| `external_product_uid` | `uuid` | Nullable future commerce-service identity; not an SQL FK. |
| `preview_mesh_uid / preview_mesh_version_uid` | `uuid` | Optional pinned mesh-service reference for the product’s hover/detail preview; no cross-database FK. |
| `name` | `varchar(160)` | Display name. |
| `description` | `text` | Public product story. |
| `price` | `numeric(14,2)` | Display price, nonnegative; never floating-point money in storage. |
| `currency` | `char(3)` | ISO currency code. |
| `material` | `varchar(255)` | Material description. |
| `dimensions` | `varchar(255)` | Human-readable dimensions. |
| `category` | `varchar(80)` | Catalog grouping. |
| `status` | `product_preview_status` | ACTIVE or HIDDEN. |

### 4. Reusable mesh assets and immutable binary versions (mesh_db)

#### `mesh_assets`

Stable identity of reusable geometry; never owns placed transforms, products or teleport interactions. Includes all common auditable columns above and **inherits `abstract_auditable_entity`**.

| Column | Type | Purpose |
|---|---|---|
| `owner_account_uid` | `varchar(255)` | Account-service owner identity. |
| `merchant_uid` | `uuid` | Optional logical game-service merchant UID, not an SQL FK. |
| `name` | `varchar(120)` | Library display name. |
| `description` | `text` | Asset description. |
| `category` | `mesh_category` | FURNITURE, LIGHTING, ARCHITECTURE, DECORATION, OTHER. |
| `status` | `publication_status` | DRAFT, PUBLISHED or ARCHIVED. |
| `published_version_id` | `integer FK` | Local pointer to the currently released mesh_versions row. |

#### `mesh_versions`

A committed export with immutable content-addressable metadata. Includes all common auditable columns above and **inherits `abstract_auditable_entity`**.

| Column | Type | Purpose |
|---|---|---|
| `asset_id` | `integer FK` | Owning mesh_assets.id. |
| `revision_number` | `integer` | Monotonic per-asset sequence. |
| `status` | `mesh_version_status` | STAGED, VALIDATED, PUBLISHED or FAILED. |
| `glb_object_key` | `text` | Relative storage key for compiled GLB; never an expiring URL. |
| `manifest_object_key` | `text` | Relative key for editable source/assembly manifest. |
| `sha256` | `char(64)` | Binary integrity digest. |
| `byte_size` | `bigint` | Export size in bytes. |
| `triangle_count` | `integer` | Performance/validation budget. |
| `bounds` | `jsonb` | Validated min/max XYZ bounds in metres. |
| `commit_message` | `text` | Optional human review note. |
| `published_at` | `timestamp` | Commit/publication instant. |

#### `mesh_source_objects`

Named source objects and normalized assembly transforms for re-editing. Includes all common auditable columns above and **inherits `abstract_auditable_entity`**.

| Column | Type | Purpose |
|---|---|---|
| `mesh_version_id` | `integer FK` | Owning version. |
| `source_instance_uid` | `uuid` | Stable object identity inside the asset. |
| `name` | `varchar(120)` | Source object label. |
| `source_type` | `mesh_source_type` | OBJ or PROCEDURAL. |
| `object_key` | `text` | Private OBJ key; null for procedural geometry. |
| `sha256` | `char(64)` | Source integrity hash, optional for procedural objects. |
| `transform` | `jsonb` | Validated position/rotation/scale plus source normalization matrix. |
| `properties` | `jsonb` | Procedural shape or import metadata, original filename, UV generation mode. |

### 5. Textures and material bindings (mesh_db)

#### `mesh_textures`

A reusable raster texture resource with immutable content key. Includes all common auditable columns above and **inherits `abstract_auditable_entity`**.

| Column | Type | Purpose |
|---|---|---|
| `owner_account_uid` | `varchar(255)` | Uploader identity resolved through account service. |
| `name` | `varchar(160)` | Human label / original filename. |
| `object_key` | `text` | Private original texture key. |
| `public_object_key` | `text` | Sanitized published derivative key, if released. |
| `sha256` | `char(64)` | Content digest; unique with owner or globally according to policy. |
| `media_type` | `varchar(80)` | Validated image/png, image/jpeg or image/webp. |
| `width / height` | `integer` | Decoded dimensions, bounded by configured limits. |
| `byte_size` | `bigint` | Stored bytes. |
| `status` | `publication_status` | DRAFT/PUBLISHED/ARCHIVED. |

#### `mesh_materials`

Versioned material parameters for export. Includes all common auditable columns above and **inherits `abstract_auditable_entity`**.

| Column | Type | Purpose |
|---|---|---|
| `mesh_version_id` | `integer FK` | Owning immutable mesh version. |
| `name` | `varchar(120)` | Material slot name. |
| `base_color` | `varchar(9)` | Validated RGB/RGBA color. |
| `roughness` | `real` | Range 0..1. |
| `metalness` | `real` | Range 0..1. |
| `base_texture_id` | `integer FK` | Optional mesh_textures.id. |
| `normal_texture_id` | `integer FK` | Optional future normal-map reference. |
| `properties` | `jsonb` | Validated UV transform, emissive and transparency settings. |

#### `mesh_material_bindings`

Maps a material to a particular source object / slot. Includes all common auditable columns above and **inherits `abstract_auditable_entity`**.

| Column | Type | Purpose |
|---|---|---|
| `source_object_id` | `integer FK` | mesh_source_objects.id, same mesh version as material. |
| `material_id` | `integer FK` | mesh_materials.id. |
| `slot_index` | `integer` | Zero-based mesh material slot. |
| `mesh_path` | `text` | Deterministic named node path for multi-mesh OBJ selection. |

### 6. Cross-service publication and delivery (each database separately)

#### `outbox_events`

Transactional event delivery; each service owns its own table. Includes all common auditable columns above and **inherits `abstract_auditable_entity`**.

| Column | Type | Purpose |
|---|---|---|
| `aggregate_uid` | `uuid` | Space/mesh/merchant stable UID, never cross-database FK. |
| `event_type` | `domain_event_type` | SCENE_PUBLISHED, MESH_PUBLISHED, MERCHANT_APPROVED or ASSET_RETIRED. |
| `payload` | `jsonb` | Versioned public event schema; no raw tokens/source file contents. |
| `status` | `outbox_status` | PENDING, SENT or FAILED. |
| `attempts` | `integer` | Retry count. |
| `available_at` | `timestamp` | Next eligible dispatch time. |
| `delivered_at` | `timestamp` | Successful publication time. |
| `last_error` | `text` | Sanitized retry diagnostic. |

## Constraint and index plan

- Each child: own primary key, own ID sequence/default, `uid NOT NULL UNIQUE DEFAULT gen_random_uuid()`, `version NOT NULL DEFAULT 0`, timestamps, explicit auditor FKs. Prefer `ON DELETE SET NULL` for auditor references in new business tables to retain audit history; do not change legacy base SQL.
- `merchant_profiles(account_uid)` unique; `merchant_memberships(merchant_id, account_uid, role)` unique; one pending application per merchant via partial unique index. Staff review notes never enter public projections.
- `game_spaces(parent_space_id)` and `(merchant_id, status)` indexes. Check longitude/latitude bounds. MAP has null parent; other kinds have a parent. Validate parent kind and no cycles transactionally (a cross-row condition cannot be a simple CHECK).
- `scene_revisions(space_id, revision_number)` unique; at most one active draft per space via partial unique index. Validate live/draft pointers refer to the same space. Add pointer FKs after revisions are created to resolve the circular dependency.
- `scene_objects(revision_id, instance_uid)` unique; indexes `(revision_id, chunk_x, chunk_z)` and `(product_preview_id)`. Validate finite transforms, strictly positive scales, bounded lights, required `mesh_uid` + `mesh_version_uid` for MESH, and kind-specific JSON schemas. Committed reusable geometry has pinned mesh references. Small ground/barrier/light records remain parametric. Imported scene OBJ content is promoted to a reusable mesh before saving.
- `portal_links(source_object_id)` unique, target FK to a concrete game space, and TELEPORT interaction/target publication validation. Any mesh kind may teleport; PRODUCT and TELEPORT are mutually exclusive. Portals may be many-to-one. Check reachability/ownership during publication.
- `product_previews(merchant_id,status)` index, `price >= 0`, exactly three uppercase currency letters. Preview products do not create inventory/order/cart tables in this stage.
- `mesh_versions(asset_id, revision_number)` unique, `(status)` index; require immutable object keys + digest before PUBLISHED. Asset's published pointer must reference its own version, checked transactionally or through a composite FK.
- `mesh_source_objects(mesh_version_id,source_instance_uid)` unique; `mesh_material_bindings(source_object_id,slot_index,mesh_path)` unique; enforce material and object belong to the same version.
- Texture digest/media/size/dimensions checks and indexes on owner/status/digest. Hash deduplication must not expose another merchant's private original.
- `outbox_events(status,available_at)` index; unique event UID used as consumer idempotency key. Publication and event insertion share one local transaction. No distributed SQL transaction across databases.

## Append-only migration example

This example is documentation, not an executable migration in the current project. It illustrates the inherited-column compatibility and explicit child constraints. Do not copy the reference's destructive DROP statements into an incremental production changeset.

```sql
--liquibase formatted sql
--changeset mesh-shop:game-001-merchant-profiles
CREATE TABLE merchant_profiles (
    id SERIAL PRIMARY KEY,
    uid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    version INTEGER NOT NULL DEFAULT 0,
    account_uid VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL CHECK (length(trim(name)) > 0),
    email VARCHAR(255),
    category VARCHAR(80),
    status merchant_status NOT NULL DEFAULT 'PENDING',
    approved_at TIMESTAMP,
    CONSTRAINT fk_merchant_created_by FOREIGN KEY (created_by)
        REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_merchant_updated_by FOREIGN KEY (updated_by)
        REFERENCES users(id) ON DELETE SET NULL
) INHERITS (abstract_auditable_entity);
CREATE INDEX idx_merchant_profiles_status ON merchant_profiles(status);
```

Use separate, ordered additions: enum types → merchant/profile tables → spaces → revision/object tables → pointer FKs → indexes. Mesh: enum types → assets without live pointer FK → versions → source/texture/material tables → bindings → pointer FK → indexes. Both databases then get their own audited outbox. Add new includes to each **future service's** master changelog; leave existing service changelogs untouched. Supply preconditions, rollback policy and integration tests when implementing migrations. Test inheritance constraints against actual PostgreSQL, not an H2 approximation.

## Publication and gRPC consistency

Within game, lock the space and confirm the draft's base generation equals the current published revision. Validate every exact mesh/version UID via repeated gRPC batches of at most 20, with bounded Page/Pageable repository queries. Commit the snapshot, live pointer and outbox event together. A failed mesh lookup or unavailable service must leave the previous live version intact. Mesh commits persist binary content before marking a version published. Retain old mesh versions while referenced by any published scene; deletion requires an explicit retention/acknowledgement process.

Cross-service messages carry UUIDs and revision UIDs/digests; Firebase user identifiers remain strings. Proposed game objects store `mesh_uid` and `mesh_version_uid` without SQL FKs. Mesh ownership stores `merchant_uid` without an SQL FK. A local service cache may retain resolved metadata, but must not become the authority. See `ABSTRACTION.md` for local fixture and gRPC adapters.

The frontend's `version` means the publication generation used for draft compare-and-swap. The SQL inherited `version` remains JPA row locking. Map them deliberately; do not equate JPA row updates with user-facing revision numbers.


## Paged queries and edit transactions

All collection/search/filter repository methods return `Page<T>` and require bounded `Pageable`; max page size is **20** across every backend service. Apply criteria and authorization before paging, use stable ID ordering, provide matching count queries, and map with `project.shared_general_starter.mapper.PaginationMapper`. Never query an abstract inherited parent, load all rows then filter, or use a nested `objects` array to bypass pagination. Internal validation, outbox and cleanup jobs also iterate bounded pages. Use database-side copying/updates where atomic publication needs all rows.

For maps, spots and places, use `(revision_id, chunk_x, chunk_z)` for cell candidates and indexed transformed X/Z bounds for overlap with the 5×5 window (24m cells). Consider PostgreSQL range/GiST indexes or PostGIS after measuring real query plans; use a count query with the exact same overlap/access/search predicates. Each request pins an immutable published revision or checks `draft_generation`. Reject generation changes between pages instead of mixing drafts. Names/category/status lists need corresponding predicate/order indexes; search collation and substring indexing must be chosen explicitly during implementation.

Add these two **audited concrete tables**, both `INHERITS (abstract_auditable_entity)` with their own PK, UUID uniqueness, auditor FKs and child sequence as above:

| Table | Additional columns | Purpose |
|---|---|---|
| `scene_edit_transactions` | `space_id` FK, `actor_account_uid`, `base_revision_id` FK, `base_draft_generation` integer, `next_page` integer, `expires_at` timestamp, `committed_at` nullable timestamp | Ownership, expiry and optimistic generation for one staged delta save. |
| `scene_edit_operations` | `transaction_id` FK, `page_number` integer, `operation_index` integer, `operation_type` scene_edit_operation_type, `instance_uid` UUID, `payload` validated jsonb | Ordered UPSERT/DELETE data; at most 20 operations per submitted page. |

Unique `(transaction_id,page_number,operation_index)`; indexes on transaction expiry/status and operation order. Verify page sequence/count and input byte budgets. At commit lock the draft, compare both publication and draft generation, merge only submitted changes, increment draft generation and commit atomically. Missing instances in a loaded viewport are untouched. Expiry cleanup uses bounded pages. A failed or expired transaction leaves the previous draft unchanged.

Enforce `interaction_type=PRODUCT` iff product reference exists, and `TELEPORT` iff a portal_links record exists; the latter requires transaction-level validation/constraint triggers because it spans tables. Geometry/source tables in mesh_db contain neither product references nor portal rows. New mesh versions retain old pinned files. See [WEBSOCKET.md](WEBSOCKET.md) for the wire contract and [API.md](API.md) for delta endpoints.
