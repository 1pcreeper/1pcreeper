# Abstraction plan — local first, no new backend implementation

This document proposes interfaces for the next backend stage. No Java classes, SQL migrations or Docker files are added in this stage. The existing `general/obj-generate-service/.../storage/StorageService` is a useful precedent: it already separates an upload interface from a MinIO implementation, although its method is specific to OBJ-generation projects.

## Interfaces needed first

| Interface | Owns | Local development implementation | Later implementation | Why separate it now |
|---|---|---|---|---|
| `MeshStorageService` | Opaque keys, byte streams, metadata, atomic put/delete/read | `LocalFileMeshStorageService` using configured directory and `Files.move` | `MinioMeshStorageService` | Controllers/domain services must not know filesystem or bucket details |
| `MeshExportService` | Validated OBJ/texture source → GLB derivative | `ClientGlbValidationService` validates the browser-produced GLB and digest | Server conversion worker adapter | Conversion lifecycle and validation differ from storage |
| `MeshCatalogClient` | Resolve mesh UID + version UID; check publication | `LocalMeshCatalogClient` fixture map | `GrpcMeshCatalogClient` | Game database must not read mesh database directly |
| `AccountDirectoryClient` | Verified user/merchant roles and claim synchronization | `LocalAccountDirectoryClient` fixture roles | Account gRPC client | Preserve account-service authority without coupling it to scene persistence |
| `ScenePublicationService` | Validation, revision creation and live pointer transaction | Normal Spring service with local repository/storage clients | Same service with production clients | Publication correctness should not change with storage backend |
| `SceneChunkQueryService` | Map/spot/place bounds + snapshot → Page of instances | Bounded Pageable PostgreSQL query / deterministic fixture query | PostGIS query adapter if adopted | Keep geometry projection and pagination out of controllers |
| `DomainEventPublisher` | After-commit publication and approval events | `LocalDomainEventPublisher` with in-process handler | Outbox → Kafka dispatcher | Avoid lost events and distributed dual writes |
| `MeshFragmentService` | Exact version → bounded Base64 fragment page | Local file range reads | MinIO range reads | Keep SockJS encoding separate from storage |
| `RealtimeMeshClient` | Game-service dispatcher → mesh-service fragment query | In-process local adapter | Authenticated paged gRPC client | One browser SockJS connection can serve both domains |
| `SceneEditTransactionService` | Ordered ≤20-operation pages, optimistic draft generation, atomic merge | Local repository implementation | Same service with PostgreSQL transaction storage | Partial scene views must never replace unseen instances |

Do **not** create an abstraction for every repository method or DTO. The useful boundaries are storage, external service communication, conversion, event delivery and spatial queries. Retain the existing service/manager/repository pattern for ordinary persistence. Keep Spring Security, Firebase validation, auditing, principal resolution, and sessions in the established shared starters rather than replacing them.

## Suggested Java shape

Illustrative only; future package `project.general_mesh_service.service.storage`:

```java
public interface MeshStorageService {
    StoredObjectDTO put(StorageWriteRequestBO request, InputStream content);
    InputStream read(String objectKey);
    StoredObjectDTO stat(String objectKey);
    void deleteUnreferenced(String objectKey);
}

@Service
@Profile("local")
public class LocalFileMeshStorageService implements MeshStorageService {
    private final MeshStorageProperties properties;

    @Autowired
    public LocalFileMeshStorageService(MeshStorageProperties properties) {
        this.properties = properties;
    }
    // Resolve only server-generated keys beneath the configured root.
    // Validate, write to staging, fsync as appropriate, atomically move,
    // and return key, media type, byte length, and SHA-256 digest.
}
```

Use constructor injection, final collaborators, `@Service`, dedicated request BO/DTOs, the existing exception advice and `APIBaseResponseDTO<T>`. Consumers must close returned streams. A future MinIO implementation has the same interface and is selected by profile/configuration. Keep MinIO client classes out of the interface.

## Local storage rules

- Start with `${MESH_STORAGE_ROOT:./data/local/mesh}` on disk. The reference ignore rules already exclude `data/local`. Do not commit uploaded models or credentials.
- Generate keys using mesh/version UUIDs, never client filenames. Preserve original names only as metadata.
- Normalize the candidate path, reject absolute/traversal paths and symlink escapes, and verify it stays under the configured root. Reject unsupported MIME/content combinations before committing a derivative.
- Store an immutable derivative first, then publish database references. If database commit fails, leave a staged/orphan record for cleanup; never replace a live file in place.
- Deletion is a retention/garbage-collection operation after proving no published scene or mesh revision references the content. A UI instance deletion does not delete its reusable asset.
- Set upload size, dimension, parse-time, triangle and storage quotas in configuration. Stream big files instead of buffering complete models in a controller.

## Existing frontend injection

`ServiceContainer` owns one auth, game, mesh, socket transport and mesh cache instance. `TransportService` is injected into content services; `MockTransportService` is the development adapter and `AxiosTransportService` is the production adapter. `MockRepositoryService` accepts `MockStateStore`; tests inject `MemoryStateStore`, Vite development uses shared local fixture storage, and explicitly built standalone demos use browser storage. Pages consume content services and paginated DTOs, not Axios or fixture files. `SocketTransportService` injects either the paged in-process simulator or the real STOMP adapter. `MeshCacheService` accepts a `MeshCacheStore` (browser IndexedDB + Cache Storage, or bounded memory for tests/fallback). It verifies complete GLB files before committing metadata; views never access MinIO directly.

`ModelFactoryService` owns Three.js construction/disposal; `WorkspaceService` owns file validation, OBJ normalization, GLB export and change comparison. This keeps the reusable viewer independent of app routing and the editor independent of backend storage.

## Mandatory paging boundary

All backend search/filter/list interfaces accept `Pageable` and return `Page<T>`; controllers and STOMP handlers wrap `PaginationMapper.toDTO(...)` in the shared API envelope. The maximum size is 20, including internal lookup and worker batches. Queries apply access, revision, spatial and search predicates in the repository. Never create a `PageImpl` by fetching/filtering an entire entity table. Mesh fragments are bounded storage ranges; a page implementation can wrap only those requested fragments.

Example signatures (design only):

```java
Page<SceneObject> findInBounds(SceneChunkQueryBO query, Pageable pageable);
Page<MeshVersion> findAuthorizedVersions(MeshVersionQueryBO query, Pageable pageable);
Page<MeshFragmentDTO> readFragments(MeshVersionReferenceBO version, Pageable pageable);
```

Single lookups/commands in the new game/mesh API also return one-element paginated responses. Existing account verification remains a coordinated compatibility exception. [API.md](API.md) defines the actual frontend DTO shapes; [WEBSOCKET.md](WEBSOCKET.md) describes the dispatcher and page loops.

## Migration order

1. Copy the dummy service template into each future service. Resolve the template's duplicate inherited Java `id` declaration as a separately reviewed backend change; it is intentionally untouched here.
2. Define owned DTOs, interfaces and local filesystem implementations, then contract tests against the current frontend API.
3. Add append-only Liquibase migrations to separate game and mesh databases. Retain local `users` mirrors for auditing.
4. Add authenticated internal gRPC adapters and public/staff gateway rules. Validate ownership on every mutation.
5. Implement atomic publication and outbox delivery. Only then switch frontend builds to the live gateway.
6. Add MinIO when needed by changing the storage profile. Migrate keys/digests without changing scene identities or the frontend component layer.
