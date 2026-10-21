# Coding Style Guide — GENERAL & OFFICE

Distilled from the actual codebase and the documents in `docs/content/`. Follow this when writing or reviewing any code in this repository. Where the two projects diverge, the difference is stated explicitly.

## 1. Shared doctrine (both projects)

1. **Response envelope** is exactly `{ success, message, data }` (`APIBaseResponseDTO<T>`), with `data: null` on failure. Static factories: `APIBaseResponseDTO.success(data)` / `APIBaseResponseDTO.error(message)`.
2. **Pagination** uses `PaginationBaseResponseDTO<T>` with fields `content, pageNumber, pageSize, totalPages, totalElements`, zero-based pages, mapped by the shared starter `PaginationMapper.toDTO(page, mapper::toResponseDTO)`.
3. **Page size cap is 20 everywhere** — REST, STOMP, gRPC, internal jobs. Apply search/access/spatial predicates inside the repository query; never `findAll()` then filter in memory. Mesh fragment pages are capped tighter at 3 (12 KiB Base64 fragments, ~48 KiB replies).
4. **Database inheritance**: every concrete table uses `INHERITS (abstract_auditable_entity)` in SQL and extends the service-local `AbstractAuditableEntity` in Java. PostgreSQL does not inherit constraints — every child redeclares `id SERIAL PRIMARY KEY`, `uid UUID UNIQUE DEFAULT gen_random_uuid()`, and `created_by`/`updated_by` FKs to the local `users` mirror. Never query the abstract parent.
5. **No cross-database foreign keys.** Cross-service references are logical `uid UUID` values (Firebase UIDs stay strings) resolved through authenticated gRPC, backed by the Caffeine cache pattern in `AbstractCacheBaseService` (thread-safe `findByKeyOrLoad` self-populating loader, 10-minute TTL, 5000-entry bound).
6. **Append-only migrations.** Liquibase changelogs live at `src/main/resources/db/changelog/` with `db.changelog-master.yaml` including numbered `changes/NN-name.sql` files. Native PostgreSQL enum types, never VARCHAR substitutes; never edit a deployed changeset.
7. **Soft delete** via `is_active`; money as `numeric(14,2)` (never float); storage object keys are relative, server-generated and immutable — never expiring URLs or client filenames.

## 2. Backend Java conventions

### Package layout

Root package is snake_case: `project.<side>_<service>_service` (e.g. `project.office_workforce_service`, `project.general_obj_generate_service`).

```
config/        # Spring configuration
constant/      # Role/service-name constants (public static final String)
controller/common/
mapper/        # Hand-written @Component mappers (no MapStruct)
model/bo/
model/dto/{object,request,response}/
model/entity/{base,enums}/
repository/{,base}/
service/{base,checker,common,manager,grpc,cache,client,storage,sync,worker}/
```

### Layered flow (Office business services — the reference pattern)

```
XxxController -> XxxService (common) -> XxxCheckerService (validate, void-or-throw)
                                    -> XxxManagerService (extends AbstractBaseService, repos ONLY)
                                    -> XxxMapper (hand-written @Component)
```

- **Controllers** inject only the common service; annotate access with `@Secured({Roles.OFFICE_ADMIN, ...})`; return `ResponseEntity<APIBaseResponseDTO<T>>`; trigger JSR-380 with `@Valid`.
- **Common services** orchestrate: checkers first, then manager calls, mapping last; `@Transactional` on state-changing methods only; return DTOs, never `ResponseEntity`.
- **Checker services** return `void` or throw; named `checkXxxIsActive`, `checkCreateRequest`, `checkUpdateRequest`; never mutate or persist.
- **Manager services** depend only on repositories; extend the per-service `service/base/AbstractBaseService<T, ID>` constructed with `super(repository, "EntityName")`.
- **Mappers** are null-safe and partial-update aware (`if (x != null) entity.setX(...)`).

The **GENERAL** services intentionally run slimmer: account/dummy use `auth + manager` only; obj-generate uses `common + manager` with inline validation. When the future game/mesh services are copied from `dummy-service`, keep their existing boundaries rather than backporting office layers.

### Naming taxonomy

| Kind | Pattern | Example |
|---|---|---|
| Controller | `XxxController` | `PlaceController` |
| Common service | `XxxService` | `VehicleService` |
| Checker | `XxxCheckerService` | `VehicleCheckerService` |
| Manager | `XxxManagerService` | `PlaceManagerService` |
| Cache | `XxxCacheService` (extends `AbstractCacheBaseService`) | `WorkforcePersonCacheService` |
| gRPC server | `OfficeXxxGrpcServiceImpl` with `@GrpcService` | `OfficeWorkforceGrpcServiceImpl` |
| DTOs | `XxxCreateRequestDTO` / `XxxUpdateRequestDTO` / `XxxResponseDTO` / `XxxDTO` | |
| Entity / enum | bare noun / `model/entity/enums/` | `Place`, `ScheduleStatus` |
| Config / runner / properties | `XxxConfig` / `XxxRunner` / `XxxProperties` | |

### Formatting and idioms

- 4-space indent, same-line braces, 8-space continuation.
- **Explicit `@Autowired` constructor injection** with `private final` fields; no `@RequiredArgsConstructor`. (Workforce `service/common/*` currently uses field injection — that is drift, not the convention.)
- Lombok on entities/DTOs: `@Data @Builder @NoArgsConstructor @AllArgsConstructor` (entities add `@Entity @Table @EqualsAndHashCode(callSuper = true)`, `@Builder.Default` for defaults). `@Slf4j` only where logging is actually used.
- Exceptions come from the starter `model/exception/` set, mapped by `GlobalExceptionAdvice`: `ResourceNotFoundException` 404, `PropertyValidationException` 400, `UnAuthorizedException` 401, `PrincipalException` 403, `DatabaseUpdateFailureException` 422.
- JPQL optional filters use the `(:param IS NULL OR ...)` pattern.
- `application.yml`: 4-space YAML, every value externalized as `${SIDE_SERVICE_*}` env vars, `hibernate.ddl-auto: none` (Liquibase owns schema), Eureka `defaultZone` with inline basic auth, `grpc.server.port`.

## 3. Frontend TypeScript conventions

### GENERAL (`frontend/general/web`) — the uniform reference

- Independent npm workspace: `mesh-shop-shared` (`@mesh-shop/shared`, source-level via barrel `src/index.ts`) + thin apps `user-mesh-shop-web` / `admin-mesh-shop-web`.
- Layers: `services/base` (transport), `services/realtime` (SockJS/STOMP), `services/content` (domain), `services/storage` (persistence), `services/ServiceContainer.ts` (composition root), `models/dto/`, `mock/`, `hooks/`, `contexts/`, `components/{common,scene}/`, `tests/`.
- Style: 4-space indent, double quotes, semicolons, `import type` for type-only imports, explicit `public`/`private readonly` member modifiers.
- **Singletons** use retained lazy `??=` with dependency injection on first call:

```ts
export default class MeshContentService {
    private static INSTANCE: MeshContentService;
    public static getInstance(transport: TransportService) {
        return (this.INSTANCE ??= new MeshContentService(transport));
    }
}
```

- `ServiceContainer` wires real vs mock adapters and is exported as a ready instance (`export const services = ServiceContainer.getInstance();`). Pages consume `services.*`, never Axios or fixtures directly.
- Transport is an `interface TransportService` with `AxiosTransportService` (XSRF `XSRF-TOKEN`/`X-XSRF-TOKEN`, bearer via `tokenProvider` callback) and `MockTransportService`; envelope is a discriminated union unwrapped by strict `unwrapOne`/`unwrapPage` helpers (`MAX_PAGE_SIZE = 20`); errors are `APIError` carrying a status.
- State: React contexts (`AuthProvider`/`useAuth`, role `ProtectedRoute`) + the custom `useAsync` hook; routing via `createBrowserRouter`.
- Tests: vitest, node environment, service-level; tests bypass singletons through public constructors and injectable stores (`MockRepositoryService(new MemoryStateStore())`).

### OFFICE (`frontend/office/web`) — per-app conventions

- No shared package; each app carries its own `api/`, `models/`, `services/content/office/<domain>/`.
- DTOs are `interface`-only, grouped in `request.dto.ts` / `response.dto.ts` / `object.dto.ts` / `enum.dto.ts` per domain; string-valued enums (`FULL_TIME = "FULL_TIME"`).
- **Singletons** use an explicit null check with a private no-arg constructor, called inline in components (no ServiceContainer):

```ts
export default class PlaceContentService {
    private static INSTANCE: PlaceContentService;
    private constructor() {}
    public static getInstance(): PlaceContentService {
        if (!PlaceContentService.INSTANCE) { PlaceContentService.INSTANCE = new PlaceContentService(); }
        return PlaceContentService.INSTANCE;
    }
}
```

- HTTP is raw `fetch`: workforce uses `apiRequest` + `officeAPI` (prepends `VITE_OFFICE_BASE_URL + "/api/v1"`, centrally unboxes the envelope, throws `APIRequestError`, `_secure` cookie via js-cookie); transport-web uses its own `baseApi` (localStorage token, no central unboxing). Match whichever app you are editing.
- State: auth context (`useOfficeAuthContext`), zustand stores, per-field `useState` forms with inline validators.
- Office has **no test setup**; do not add test scaffolding unless asked.

## 4. Known inconsistencies (do not copy these)

1. `office-workforce-web/src/services/content/office/{workforce,account}/auth.ts`: `private static readonly INSTANCE` is never assigned, so `getInstance()` is not actually a singleton.
2. Workforce `service/common/*Service.java` uses field injection; everything else uses constructor injection.
3. Office frontend drift: 2-space files (`base.dto.ts`, `useEngineStore.ts`, `env.config.ts`), mixed quote styles, a stray `console.log` in `office.api.ts`.
4. `office-transport-web` diverges from workforce (own `baseApi`, localStorage auth, flat DTO files, bundled Express mock server).
5. `obj-generate-service/application.yml` hardcodes MinIO credentials against the env-var rule.
6. Minor: fully-qualified `java.util.Optional` inline in `PlaceManagerService`/`PlaceRepository`; redundant `@Id` redeclarations in `AbstractAuditableEntity` and general `AppUser`.

## 5. Related documents

- GENERAL: [ARCHITECTURE](content/general/ARCHITECTURE.md), [API](content/general/API.md), [DATABASE](content/general/DATABASE.md), [ABSTRACTION](content/general/ABSTRACTION.md), [WEBSOCKET](content/general/WEBSOCKET.md), [MESH_BUCKET](content/general/MESH_BUCKET.md)
- OFFICE: [ARCHITECTURE](content/office/ARCHITECTURE.md), [BACKEND_LAYERS](content/office/BACKEND_LAYERS.md), [API](content/office/API.md), [DATABASE](content/office/DATABASE.md), [GRPC](content/office/GRPC.md), [GRPC_UID_LINKING](content/office/GRPC_UID_LINKING.md), [ABSTRACTION](content/office/ABSTRACTION.md), [VRD_STORAGE_OCR](content/office/VRD_STORAGE_OCR.md)
- Cache patterns: [AppUserCacheService](AppUserCacheService.md), [AppUserManagerService_WithCacheExample](AppUserManagerService_WithCacheExample.md), [RedisCacheConfig](RedisCacheConfig.md)
