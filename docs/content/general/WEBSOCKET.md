# SockJS / STOMP mesh streaming plan

Updated 3 October 2026. The frontend clients and development simulator are implemented. **Java game-service, mesh-service, gateway changes, PostgreSQL migrations and MinIO deployment are future work.** Original backend and SQL files remain unchanged.

## The two buckets

- **Browser storage bucket:** a disposable, per-origin cache on the visitor’s device. IndexedDB stores version/integrity metadata; Cache Storage holds complete GLB blobs. Use a named Storage Bucket when its Cache API is available, otherwise the origin’s normal Cache Storage. This is never MinIO.
- **Backend mesh bucket:** private MinIO bucket `mesh`, accessed through mesh-service. It stores immutable GLB versions and private sources. Browser requests never contain MinIO credentials or arbitrary object keys.

```mermaid
sequenceDiagram
    participant B as Browser
    participant G as Game-service STOMP dispatcher
    participant D as Game database
    participant C as IndexedDB + browser cache
    participant M as Mesh-service
    participant S as MinIO mesh bucket
    B->>G: /app/game/chunks (space, cells, snapshot, page, size ≤ 20)
    G->>D: Spatial/filter query with Pageable
    D-->>G: Page of mesh IDs, versions, transforms, interactions
    G-->>B: APIBaseResponseDTO<PaginationBaseResponseDTO<SceneObjectDTO>>
    Note over B,G: Repeat pages until totalPages is reached
    B->>C: Look up meshId@versionId and verify file
    alt Matching complete file
        C-->>B: Cached GLB
    else Missing, changed or corrupt
        B->>G: /app/mesh/fragments (meshId, versionId, page, size=3)
        G->>M: Authenticated bounded fragment RPC
        M->>S: Read exact immutable object byte ranges
        S-->>M: Bytes
        M-->>G: Page of Base64 fragments
        G-->>B: Correlated paginated reply
        Note over B,M: Repeat pages, validate sequence/size/SHA-256
        B->>C: Store blob, then commit IndexedDB completion record
    end
    B->>B: Apply instance transforms; hide distant objects
```

## One browser connection, two service responsibilities

Configure `VITE_STREAM_URL=/api/v1/realtime`. The gateway routes this SockJS HTTP endpoint and its WebSocket upgrade/fallback requests to a STOMP dispatcher hosted by **game-service**. Register `/realtime` using `withSockJS()`, application prefix `/app`, user prefix `/user`, and a queue broker. The dispatcher owns `/game/chunks` and delegates `/mesh/fragments` to mesh-service through an authenticated internal gRPC client. Mesh-service owns authorization, version lookup, MinIO reads and Base64 encoding. It does not put MinIO behind a WebSocket server.

This multiplexing is an explicit architecture choice: an HTTP gateway cannot route individual STOMP messages after establishing a connection. A second independent SockJS connection per service is avoided because SockJS fallback transports can exhaust per-origin connection limits. Each reconnect must construct a **new** SockJS instance. [SockJS guidance](https://stomp-js.github.io/guide/stompjs/rx-stomp/using-stomp-with-sockjs.html), [STOMP client lifecycle](https://stomp-js.github.io/guide/stompjs/using-stompjs-v5.html).

Subscribe to `/user/queue/mesh-shop` before sending requests. Every SEND includes a unique `correlation-id` header and matching `requestId` in JSON. Copy that header to the response MESSAGE. The JSON body stays exactly the shared API envelope. Use session-scoped replies (`@SendToUser(broadcast=false)` or `convertAndSendToUser` with the originating session headers); never publish mesh/draft responses on a global topic. Anonymous visitors still need an isolated session reply. [Spring user destinations](https://docs.spring.io/spring-framework/reference/web/websocket/stomp/user-destination.html).

In a multi-instance deployment, route SockJS fallback requests to the same session owner and configure user-destination/broker routing across nodes. Start with one dispatcher in local integration; do not assume the simple broker is a distributed production broker.

## Page contract: maximum 20 everywhere

Use the existing classes:

- `project.shared_general_starter.model.dto.base.APIBaseResponseDTO`
- `project.shared_general_starter.model.dto.base.PaginationBaseResponseDTO`
- `project.shared_general_starter.mapper.PaginationMapper`

Pages are zero-indexed. Fields are **content, pageNumber, pageSize, totalPages, totalElements**. Clamp `size` to 1–20 at every REST/STOMP/gRPC entry point and again at repository/service boundaries. Validate nonnegative integer page numbers. Reject unbounded `Pageable`, unapproved sort fields and excessive offsets. Apply search, merchant access, publication, space revision and spatial predicates **inside the database query**. Never call repository `findAll()` and filter a collection in a manager.

Illustrative service logic, to adapt to the template’s actual BO/mapper classes:

```java
Pageable pageable = PageRequest.of(
    Math.max(0, request.getPage()),
    Math.min(20, Math.max(1, request.getSize())),
    Sort.by("instanceUid").ascending()
);
Page<SceneObject> page = repository.findVisibleInBounds(
    authorizedRevisionId, minX, maxX, minZ, maxZ,
    request.getSearch(), request.isInteractiveOnly(), pageable
);
PaginationBaseResponseDTO<SceneObjectResponseDTO> result =
    paginationMapper.toDTO(page, sceneObjectMapper::toResponseDTO);
// Return result inside the existing APIBaseResponseDTO success envelope.
```

The repository returns `Page<T>`, including a count query with the same predicates. Mapping only `page.getContent()` is bounded. A `PageImpl` is appropriate for a previously bounded fragment page or a singular command result; it is **not** permission to load an entire entity table. This rule applies to account/admin searches, merchant approvals lists, texture/material catalogs, source objects, outbox cleanup and cross-service lookups as well as chunks. [Spring Data paging](https://docs.spring.io/spring-data/commons/reference/repositories/query-methods-details.html).

Success replies for new game/mesh singular lookups and commands use one-element pages (`pageSize=1`). Failure remains `{ "success": false, "message": "...", "data": null }`, following the existing shared API contract. Existing account verification is a singular legacy API and keeps its existing envelope until a separately coordinated backend migration.

## Chunk requests for all spaces

```json
{
  "requestId": "unique-request-uuid",
  "type": "places", "id": "1", "x": 0, "z": 0,
  "snapshotVersion": 1, "draft": false,
  "page": 0, "size": 20
}
```

`x=floor(localX/24)`, `z=floor(localZ/24)`. Radius **2** means **5×5 cells**, or 120 metres per side before geometry overlap. This replaces the previous 12-metre, 3×3 map-only view. Maps, spots and places in both apps share these constants. Spectator mode uses the orbit target; first-person uses the visitor position. Keep camera mode across transitions; teleport carries destination type, numeric ID, foot position `[x,y,z]` and yaw in radians.

Use transformed mesh bounds to include large geometry crossing cell edges. The fixture uses a conservative `max(scale)*4m` margin because imported source geometry is normalized; production must query actual indexed bounds, not assume all meshes share dimensions. Stable sort is by instance UID. Return IDs, exact immutable mesh version IDs, transforms, visibility and per-instance interaction metadata, **never GLB or OBJ source content** in chunk rows. Lights, grounds and barriers may use small typed parametric payloads.

Each page belongs to `snapshotVersion`. Published snapshots must remain immutable for the whole paging sequence. Draft requests additionally include `draftRevision` and require staff authorization. If either changes, fail the old request and let the browser reload metadata. Do not mix generations. Directory search adds `interactiveOnly=true` and `search`, with a page size of 10; apply these predicates before pagination.

The browser requests pages sequentially, cancels obsolete window requests, and ignores late responses. Current cells replace current metadata; far objects are hidden and retained up to a bounded history budget (512 entries unless the current window itself needs more). This budget must never truncate the current window. Scene editing preserves loaded/unsaved instances and sends deltas, not a partial world replacement. See [API.md](API.md).

## Mesh transfer over SockJS text messages

```json
{ "requestId": "unique-request-uuid", "meshId": "123", "versionId": "immutable-version-uid", "page": 0, "size": 3 }
```

```json
{
  "success": true, "message": "",
  "data": {
    "content": [{
      "meshId": "123", "versionId": "immutable-version-uid",
      "index": 0, "fragmentCount": 2, "byteLength": 18000,
      "sha256": "64-lowercase-hex-digest-of-complete-glb",
      "base64": "base64-of-this-byte-range"
    }, {
      "meshId": "123", "versionId": "immutable-version-uid",
      "index": 1, "fragmentCount": 2, "byteLength": 18000,
      "sha256": "64-lowercase-hex-digest-of-complete-glb",
      "base64": "base64-of-last-byte-range"
    }],
    "pageNumber": 0, "pageSize": 3, "totalPages": 1, "totalElements": 2
  }
}
```

Split raw bytes into **12 KiB** fragments and Base64-encode each independently. Base64 expands three bytes to four characters; request **3 fragments/page** so one reply is approximately 48 KiB plus metadata. Mesh-service caps fragment-page size at 3 even though the global maximum is 20. It computes `fragmentCount=ceil(byteLength/12288)` from immutable metadata and range-reads only that requested page. A bounded `PageImpl<MeshFragmentDTO>` is mapped with `PaginationMapper`. The maximum accepted GLB size is 64 MiB in the current frontend.

A response page cap alone does not control byte size. Configure Spring transport/broker/gateway message, send-buffer and timeout limits together; permit at least 64 KiB for these responses, measure JSON overhead, and reject unexpected large messages. Don’t raise limits to carry an entire multi-megabyte Base64 GLB in one frame. Use Java’s standard `Base64.getEncoder().encodeToString(bytes)` without MIME line wrapping. [Spring STOMP performance limits](https://docs.spring.io/spring-framework/reference/web/websocket/stomp/configuration-performance.html).

The client validates page counts, consecutive fragment indexes, mesh/version, total bytes, GLB 2 header and whole-file SHA-256. Incomplete, reordered, stale-version or corrupt downloads never get a completion record. Three asset jobs run concurrently; duplicate requests for one version share the same promise. Transport loss fails the pending operation; retry starts a fresh transfer of the pinned version. Resume offsets, compressed GLBs and LOD selection are later optimizations.

## Browser cache commit and eviction

Key both stores by `meshId@versionId`:

- IndexedDB `mesh-district-index-v2`, store `meshes`: key, meshId, versionId, byteLength, sha256, savedAt.
- Storage bucket `mesh-assets` → Cache Storage `mesh-files-v2`, or the default origin Cache Storage if unavailable. `/__mesh_cache/{encoded-key}` is a synthetic cache key; it is not an HTTP API.
- A cache hit requires both metadata and a matching complete blob. Verify length/header/digest before reuse. Browser eviction can remove either independently.
- Write the verified blob first, then the IndexedDB record. A crash between them produces a recoverable miss; never mark a partial file complete.
- Storage denial/quota errors use an in-memory fallback capped at 64 files / 128 MiB. Object URLs are capped at 64 and revoked when evicted; Three.js resources are disposed on replacement/unmount. Persistent files remain subject to browser quota/eviction; no durable-storage permission is requested automatically.

Browser buckets are feature-detected because available APIs differ. Admin and visitor deployments on different origins have independent caches, even when they use the same MinIO backend. [Chrome Storage Buckets overview](https://developer.chrome.com/docs/web-platform/storage-buckets).

## Security and backend delivery stages

1. Copy the dummy-service template into the future game/mesh services; keep controller → service → manager → repository and constructor injection. Add reviewed dependencies/configuration there, not in existing unrelated modules.
2. Add bounded repository queries and `PaginationMapper` contract tests first. Publish immutable source/object snapshots and use optimistic draft generations; paged edits must not delete unloaded instances.
3. Register SockJS and session-private replies. Public visitors may request only published scene/mesh versions. Draft reads and all mutations require current staff/owner permissions. Do not trust a `draft` flag or user-supplied principal/session ID.
4. Keep existing Spring Security sessions, CSRF and origin checks. The client sends refreshed Firebase bearer and CSRF values in **STOMP CONNECT headers**; SockJS cannot attach arbitrary HTTP handshake headers. If using bearer CONNECT auth, implement a verified inbound-channel interceptor and bind the Principal before message authorization. Spring does not interpret an arbitrary Authorization STOMP header automatically. Revalidate expiry/roles for ongoing privileged sessions and reconnect on authentication changes. [Spring STOMP authentication](https://docs.spring.io/spring-framework/reference/web/websocket/stomp/authentication.html).
5. Mesh-service resolves the numeric public mesh ID to internal UID + version and checks publication before any storage read. Internal forwarding includes validated principal/context and service authentication; clients cannot choose arbitrary file paths or gRPC destinations.
6. Initially implement local filesystem storage with the same keys. Add MinIO through `MeshStorageService` later. Test large pages, malicious sizes, session isolation, token expiry, fallback transports, network loss, multi-tab edits and digest errors against a real Spring/MinIO environment before release.

The current mock runs the same request/page/cache pipeline in-process and generates GLB fixtures locally. It does not open a SockJS connection or contact MinIO. Production selects the STOMP adapter and fails visibly if the future backend is unavailable; it never silently returns demo data.
