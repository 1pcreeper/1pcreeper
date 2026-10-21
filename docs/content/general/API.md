# Mesh Shop API contract

Updated 3 October 2026. This is the contract implemented by the frontend adapters and local simulator. The game/mesh backend endpoints remain **planned**, as requested; original Java and SQL are unchanged. [WEBSOCKET.md](WEBSOCKET.md) specifies streaming, security, paging and failure behavior.

## Common response and paging rules

Base REST URL `/api/v1`; production REST uses Axios with credentials, refreshed Firebase bearer when present, and the existing `XSRF-TOKEN` / `X-XSRF-TOKEN` convention. Streaming uses SockJS `/api/v1/realtime` and STOMP session-private replies.

Every successful **new game/mesh** response, including singular reads and command acknowledgements, is:

```ts
type Response<T> = APIBaseResponseDTO<PaginationBaseResponseDTO<T>>;
interface PaginationBaseResponseDTO<T> {
    content: T[];
    pageNumber: number; // zero-based
    pageSize: number;   // 1..20
    totalPages: number;
    totalElements: number;
}
```

```json
{"success":true,"message":"","data":{"content":[{"id":"13","name":"Form & Field"}],"pageNumber":0,"pageSize":1,"totalPages":1,"totalElements":1}}
```

Failures retain the existing envelope: `{"success":false,"message":"...","data":null}`. REST status codes must reflect missing resources (404), authentication (401), authorization (403), conflicts (409), invalid inputs (400/422), oversize content (413) and unsupported types (415). STOMP application failures return this body to the originating session with its correlation header. Transport loss rejects outstanding requests.

All list/search/filter APIs accept `page=0&size=20&search=...`, plus the table-specific filters below. Repository queries return `Page<T>` with bounded `Pageable`, mapped by `project.shared_general_starter.mapper.PaginationMapper`. Enforce the cap in **every backend service**; no unpaged `findAll()` followed by filtering, including internal jobs and gRPC lookup lists. Stable sorting and counts must use the same predicates. Mock array slicing is a fixture implementation, never the backend design.

List/single scene metadata returns `objects: []` and `objectCount`; mesh metadata additionally omits `glbUrl`. Nested arrays must not bypass the page cap. Use chunk requests or source-object pages to load those collections. Frontend lists show page controls; searchable dropdowns request 10 options at a time. Local editor hierarchy/change review paginates already loaded, potentially unsaved objects; it is not a server search of the entire world.

## Account compatibility

`GET /account/auth/verify` remains the existing `APIBaseResponseDTO<AccountResponseDTO>` singular response. It is not a collection search. Firebase SDK owns login/register; the server owns roles and sessions. Do not break that existing backend in this frontend-only stage. New account lists must follow the same 20-item paging rule; coordinate any later singular-envelope migration with all existing clients.

`AccountResponseDTO` includes numeric id, Firebase string uid, name/displayName, email and roles. `_secure` is synchronized by the client as originally requested; JavaScript cannot make it HttpOnly. Preserve the current Spring session/CSRF controls. Studio permits ADMIN/STAFF and the reference GENERAL_ADMIN/GENERAL_STAFF roles; real servers must enforce role and ownership independently.

## Scene and merchant REST endpoints

`{dimension}` is `maps`, `spots` or `places`. Mesh and space route IDs are **numeric decimal strings** (`/meshes/123`, `/game/places/123`); strings avoid JavaScript integer precision loss. `uid` remains the cross-service identity, separate from these service-owned IDs. Object instance IDs are opaque UUIDs. Fixture map `0` remains the default district; production must seed/resolve that route deliberately.

Every result in this table is the element type inside the paginated envelope.

| Method | Route | Access | Request / filters | Element result |
|---|---|---|---|---|
| GET | `/game/{dimension}/{id}` | Public | Published metadata only | `SceneResponseDTO` |
| GET | `/game/scenes` | Staff/admin | page, size, search, type, status | `SceneResponseDTO` |
| GET | `/game/{dimension}/{id}/draft` | Staff/admin | Current private draft or published baseline metadata | `SceneResponseDTO` |
| POST | `/game/{dimension}` | Staff/admin | Name, description, type, approved merchant (optional for map), parent, geographic origin; objects empty | New private `SceneResponseDTO` |
| POST | `/game/{dimension}/{id}/draft/transactions` | Staff/admin | `{version,draftRevision}` | `{id: transactionId}` |
| PUT | `/game/{dimension}/{id}/draft/transactions/{tx}/pages` | Staff/admin | Ordered page of at most 20 UPSERT/DELETE operations | `{id: transactionId}` |
| POST | `/game/{dimension}/{id}/draft/transactions/{tx}/commit` | Staff/admin | `{name,description,version,pageCount}` | Saved `SceneResponseDTO` |
| DELETE | `/game/{dimension}/{id}/draft` | Staff/admin | Discard private draft | `boolean` |
| POST | `/game/{dimension}/{id}/publish` | Staff/admin | `{version,draftRevision}` | Published `SceneResponseDTO` |
| GET | `/game/products` | Public | page, size, search, category | `ProductResponseDTO` |
| GET | `/game/products/{id}` | Public | Exact product | `ProductResponseDTO` |
| GET | `/game/merchants` | Staff/admin | page, size, search, status | `MerchantResponseDTO` |
| POST | `/game/merchants/{id}/approve` | Admin | Idempotent approval | `MerchantResponseDTO` |

The browser creates metadata first and, if necessary, sends initial geometry via a draft transaction. No collection is packed into a one-row scene response. Approval only changes local fixture roles today; future account claim synchronization needs the outbox/gRPC plan.

### Safe partial editing

Opening an editor loads nearby chunks, not the complete scene. Saving compares loaded objects against their loaded baseline, then sends only changes:

```json
{
  "content": [{"operation":"DELETE","id":"instance-uuid"}],
  "pageNumber":0,"pageSize":20,"totalPages":1,"totalElements":1
}
```

UPSERT also contains `object: SceneObjectDTO` with the same ID. The transaction validates ordering, operation count, owner, publication version, draft revision and expiry. Commit merges these operations into the full server-side draft atomically. Omitted IDs are **unchanged**, never deleted. A metadata-only edit has zero operation pages. The fixture expires unfinished transactions after five minutes. Real storage should keep paged operation rows, not a session-sized list of all entity data.

`draftRevision` advances on every successful save; `version` advances on publication. Conflicting writers must reload. Publish validates all references in pages of at most 20, creates an immutable snapshot, moves the live pointer and inserts an outbox event in one transaction. No need to deserialize every scene entity at once; use bounded repository queries and database-side snapshot copying. Uploaded geometry created directly in a scene becomes a numeric mesh asset on save, and the scene stores its pinned ID/version. Grounds, barriers and lights remain typed parametric scene data.

## Streaming endpoints

| STOMP destination | Request | Paginated element |
|---|---|---|
| `/app/game/chunks` | `{type,id,x,z,snapshotVersion,draft?,draftRevision?,interactiveOnly?,search?,page,size}` | `SceneObjectDTO` |
| `/app/mesh/fragments` | `{meshId,versionId,page,size}` | `MeshFragmentDTO` |

Use one SockJS connection and `/user/queue/mesh-shop` subscription. Each SEND and reply includes `correlation-id`; request JSON also contains `requestId`. Both services remain distinct: the game-service dispatcher forwards mesh fragment requests to mesh-service; mesh-service reads backend MinIO. See [WEBSOCKET.md](WEBSOCKET.md) for exact examples.

Chunk size is 24m, radius 2 (5×5). The camera’s local position/target chooses the window in **all three space types and both apps**. Rows are stable for the pinned snapshot. The browser repeats requests through `totalPages`, then updates the visible region and hides distant objects. Product directory searches are server-filtered pages, separate from render-data pages. Every map/spot/place response includes IDs/versions and transformations; model data is downloaded only for a cache miss.

```ts
interface TransformDTO {
    position: [number, number, number]; // local metres, Y up
    rotation: [number, number, number]; // Euler XYZ radians
    scale: [number, number, number];    // positive finite factors
}
type InteractionDTO =
    | {type: "PRODUCT"; productId: string}
    | {type: "TELEPORT"; destination: {
          type: "maps" | "spots" | "places"; id: string;
          position: [number, number, number]; // feet, in destination coordinates
          yaw: number; // radians; 0 looks toward local -Z
      }};
interface SceneObjectDTO extends TransformDTO {
    id: string; name: string; type: string; color: string; visible: boolean;
    assetId?: string; assetVersionId?: string;
    interaction?: InteractionDTO; // belongs ONLY to this placed instance
    colorOverride?: boolean; textureId?: string;
    intensity?: number; longitude?: number; latitude?: number;
}
interface SceneResponseDTO {
    id: string; uid: string; type: "maps" | "spots" | "places";
    name: string; description: string; merchantId?: string;
    parent?: {type: "maps" | "spots" | "places"; id: string};
    status: "DRAFT" | "PUBLISHED"; version: number; draftRevision?: number;
    objects: []; objectCount: number; updatedAt: string;
    longitude: number; latitude: number;
}
interface MeshFragmentDTO {
    meshId: string; versionId: string; index: number; fragmentCount: number;
    byteLength: number; sha256: string; base64: string;
}
```

Interaction type is independent of geometry. Any placed mesh can preview a product or teleport; a reusable asset/source object cannot. Legacy `productId`/`target` fields are read only by local fixture migration. Enforce valid product/destination, published target and ownership server-side. A portal may point to another location in the same space.

## Mesh and texture REST endpoints

| Method | Route | Access | Request | Paginated element |
|---|---|---|---|---|
| GET | `/mesh/assets` | Published metadata | page, size, search, category | `MeshResponseDTO` |
| GET | `/mesh/assets/{id}` | Published metadata | Numeric ID | `MeshResponseDTO` |
| GET | `/mesh/assets/{id}/objects` | Staff/owner | versionId, page, size | Editable source object |
| POST | `/mesh/assets` | Staff/admin | Named source assembly, generated GLB data URI, empty ID | Committed `MeshResponseDTO` |
| PUT | `/mesh/assets/{id}` | Staff/admin | Same, with expected version | New `MeshResponseDTO` version |
| GET | `/mesh/textures` | Published metadata | page, size, search | `TextureResponseDTO` |
| GET | `/mesh/textures/{id}` | Authorized/published | Exact ID | `TextureResponseDTO` |
| POST | `/mesh/textures` | Staff/admin | `{id,name,url}` with image data URI in fixture adapter | `TextureResponseDTO` |

`MeshResponseDTO` has `id,name,description,category,version,versionId,status,updatedAt,objectCount,previewType,previewColor,objects:[]`. `versionId` is immutable (mock `123-v2`; production version UID). Editing numeric `/meshes/123` pages through its source objects. The editor’s returned in-memory DTO can combine source pages for one asset, but each transport response contains at most 20 items. Server sources are staff-only even when the derivative is public.

`TextureResponseDTO={id,name,url}`. `ProductResponseDTO` includes id, name, merchant, description, price, currency, category, material, dimensions, color, type and optional preview assetId/assetVersionId. Product hover opens a small 3D preview with name/price/See More; full details use a full-screen dialog. Display prices are not checkout arithmetic; the future commerce service needs decimal/minor-unit contracts.

Mesh source objects strip all interactions on commit. Existing placed objects keep their pinned versions after a new library commit; replacing a placement or explicitly updating its version is required to adopt a new asset revision. Binary delivery now uses Base64 fragment pages over SockJS, **not a direct browser MinIO/binary GET contract**. Backend MinIO contains bytes, not Base64 copies.

The initial mock upload contract still carries client-exported GLB/source JSON and image data URIs. For production large uploads, add staged multipart upload IDs and a bounded assembly-page transaction before commit; keep success acknowledgements paginated. Never fetch arbitrary client-supplied remote URLs. Current imports cap OBJ at 8 MB / 600,000 vertices, textures at 4 MB / 4096px, batch at 20 files; local fixture state caps at 40 MB. Validate actual contents, not file extensions alone. Mesh streaming caps complete GLB at 64 MiB.

## Backend validation and ownership

Preserve Spring Security sessions, role verification, audit inheritance and existing response advice. Validate finite transforms, numeric route IDs, unique instance IDs, merchant access, parent kinds/cycles, legal target coordinates, pinned versions and byte budgets. Every new concrete database table inherits `abstract_auditable_entity`. Game references mesh UID/version UID through authenticated gRPC; no cross-database FK. Each internal collection query and validation batch is at most 20. See [DATABASE.md](DATABASE.md), [ERD_DIAGRAMS.md](ERD_DIAGRAMS.md), [ABSTRACTION.md](ABSTRACTION.md) and [MESH_BUCKET.md](MESH_BUCKET.md).

`/game/spots/13?productId=1234` is a **browser route** opening a product dialog; it is not a scene API filter. `/meshes/123` is the admin editor; `/mesh/assets/123` is metadata. Shopping, carts and payments remain outside this stage.
