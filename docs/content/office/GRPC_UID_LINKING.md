# Office Enterprise System — gRPC Inter-Service Communication & UID Linking

## 1. Overview & Architectural Principle

In the Office microservice suite, domain services (`workforce-service`, `transport-service`, `account-service`, `expenditure-service`) each own an independent database instance. Cross-database queries and foreign keys are strictly prohibited.

Instead, relationships spanning domain boundaries use **immutable `uid UUID` keys** resolved through **Eureka-discovered gRPC remote procedure calls**, backed by an **In-Memory Caffeine Cache** layer.

---

## 2. Proto Definition: `workforce.proto`

To allow `transport-service` to resolve Person details for vehicle ownership and driver verification, the following proto contract is established in `backend/shared/office-starter/src/main/proto/workforce.proto`:

```protobuf
syntax = "proto3";

package office_workforce;
option java_multiple_files = true;
option java_package = "project.shared_office_starter.grpc";
option java_outer_classname = "OfficeWorkforceServiceProto";

service OfficeWorkforceRPCService {
  rpc getPersonByUid (OfficePersonRequest) returns (OfficePersonResponse);
  rpc verifyPersonActive (OfficePersonRequest) returns (OfficePersonActiveResponse);
}

message OfficePersonRequest {
  string uid = 1;
}

message OfficePersonResponse {
  string uid = 1;
  string nameEnglish = 2;
  string nameChinese = 3;
  string mobileTel = 4;
  string officeTel = 5;
  string email = 6;
  string hkId = 7;
  bool isActive = 8;
}

message OfficePersonActiveResponse {
  string uid = 1;
  bool isActive = 2;
}
```

---

## 3. Eureka Discovery & ManagedChannel Lifecycle

In `backend/shared/office-starter/src/main/java/project/shared_office_starter/config/GrpcStubConfig.java`:

```java
@Configuration
public class GrpcStubConfig {
    @Autowired
    private EurekaClient eurekaClient;

    @Value("${grpc.client.office-workforce-service.port:20000}")
    private int officeWorkforceServicePort;

    @Bean
    public ManagedChannel officeWorkforceServiceManagedChannel() {
        String serviceAddress;
        try {
            InstanceInfo instanceInfo = eurekaClient.getNextServerFromEureka(
                ServiceRegistryIDNames.OFFICE_WORKFORCE_SERVICE, false
            );
            serviceAddress = instanceInfo.getIPAddr();
        } catch (Exception e) {
            serviceAddress = ServiceRegistryIDNames.OFFICE_WORKFORCE_SERVICE;
        }

        return ManagedChannelBuilder.forAddress(serviceAddress, officeWorkforceServicePort)
            .usePlaintext()
            .enableRetry()
            .defaultServiceConfig(buildServiceConfig())
            .build();
    }

    @Bean
    public OfficeWorkforceRPCServiceGrpc.OfficeWorkforceRPCServiceBlockingStub officeWorkforceRPCServiceBlockingStub() {
        return OfficeWorkforceRPCServiceGrpc.newBlockingStub(officeWorkforceServiceManagedChannel());
    }

    private Map<String, Object> buildServiceConfig() {
        return Map.of(
            "loadBalancingConfig", List.of(
                Map.of("weighted_round_robin", Map.of()),
                Map.of("round_robin", Map.of()),
                Map.of("pick_first", Map.of("shuffleAddressList", true))
            ),
            "methodConfig", List.of(
                Map.of(
                    "name", List.of(Map.of("service", "")),
                    "waitForReady", true,
                    "retryPolicy", Map.of(
                        "maxAttempts", (double) 5,
                        "initialBackoff", "0.5s",
                        "backoffMultiplier", "2.0",
                        "maxBackoff", "2.0s",
                        "retryableStatusCodes", List.of("UNAVAILABLE")
                    )
                )
            )
        );
    }
}
```

---

## 4. Resolving Vehicle Owners in `transport-service`

When `office-transport-web` requests `GET /api/v1/transport/vehicles/{id}`, the backend performs:

```
[Client] -> GET /transport/vehicles/{id}
               │
          [VehicleController]
               │
          [VehicleService]
               │-- Reads Vehicle entity via VehicleManagerService (Caffeine cached)
               │-- Calls WorkforceDirectoryClient.getPersonByUid(personUid)
               │        │-- Checks WorkforcePersonCacheService (Caffeine in-memory cache)
               │        │-- Cache HIT: returns cached PersonSummaryDTO immediately
               │        │-- Cache MISS: executes gRPC getPersonByUid, caches result, returns
               │-- Enriches VehicleDetailResponseDTO with PersonSummaryDTO
               │
         Returns 200 OK with Owner Details
```

---

## 5. In-Memory Caffeine Cache Architecture & Patterns

The caching layer strictly adheres to the enterprise architectural patterns defined across the system:
1. Base Cache Foundation: `AbstractCacheBaseService.java`
2. Cache Service Specialization: `AppUserCacheService.md` pattern
3. Entity Manager Caching: `AppUserManagerService_WithCacheExample.md` pattern

### 5.1 Caffeine Cache Configuration (`CaffeineCacheConfig.java`)

Configured centrally in `backend/shared/office-starter/src/main/java/project/shared_office_starter/config/CaffeineCacheConfig.java`:

```java
@Configuration
@EnableCaching
public class CaffeineCacheConfig {

    @Bean
    @Primary
    public CacheManager cacheManager() {
        CaffeineCacheManager nativeCaffeineCacheManager = new CaffeineCacheManager();
        nativeCaffeineCacheManager.setCaffeine(
            Caffeine.newBuilder()
                .initialCapacity(100)
                .maximumSize(5000)
                .expireAfterWrite(Duration.ofMinutes(10))
                .recordStats()
        );

        // Wrap inside Spring's TransactionAware Proxy Wrapper to synchronize cache mutations with DB transactions
        return new TransactionAwareCacheManagerProxy(nativeCaffeineCacheManager);
    }
}
```

### 5.2 Base Cache Service Foundation (`AbstractCacheBaseService.java`)

Located in `backend/shared/office-starter/src/main/java/project/shared_office_starter/service/base/AbstractCacheBaseService.java`.
Provides a **thread-safe, self-populating loader pattern** leveraging Spring's native cache locks to guarantee **zero cache stampedes**:

```java
public abstract class AbstractCacheBaseService<C> {
    private final String cacheKey;
    private final Class<C> cacheClass;
    private final Cache cache;

    protected AbstractCacheBaseService(String cacheKey, Class<C> cacheClass, CacheManager cacheManager) {
        this.cacheKey = cacheKey;
        this.cacheClass = cacheClass;
        this.cache = cacheManager.getCache(cacheKey);
    }

    public C save(Object key, C cacheDTO) {
        if (cache != null && key != null && cacheDTO != null) {
            cache.put(key, cacheDTO);
        }
        return cacheDTO;
    }

    // Thread-safe self-populating loader pattern (prevents stampedes)
    public C findByKeyOrLoad(Object key, Supplier<C> loader) {
        if (cache == null || key == null) return loader.get();
        return cache.get(key, () -> loader.get());
    }

    public void delete(Object key) {
        if (cache != null && key != null) cache.evict(key);
    }

    public void clear() {
        if (cache != null) cache.clear();
    }
}
```

### 5.3 Cross-Service DTO Cache Service Pattern (`WorkforcePersonCacheService.java`)

Conforming directly to `docs/AppUserCacheService.md`:

```java
package project.office_transport_service.service.cache;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;
import project.office_transport_service.model.dto.object.PersonSummaryDTO;
import project.shared_office_starter.service.base.AbstractCacheBaseService;

@Service
public class WorkforcePersonCacheService extends AbstractCacheBaseService<PersonSummaryDTO> {

    @Autowired
    public WorkforcePersonCacheService(CacheManager cacheManager) {
        super("workforce_persons", PersonSummaryDTO.class, cacheManager);
    }
}
```

### 5.4 Consuming gRPC with Self-Populating Cache Loader (`GrpcWorkforceDirectoryClient.java`)

`transport-service` resolves owner data through `WorkforceDirectoryClient`:

```java
@Slf4j
@Service
public class GrpcWorkforceDirectoryClient implements WorkforceDirectoryClient {

    private final OfficeWorkforceRPCServiceGrpc.OfficeWorkforceRPCServiceBlockingStub workforceStub;
    private final WorkforcePersonCacheService workforcePersonCacheService;

    @Autowired
    public GrpcWorkforceDirectoryClient(
        OfficeWorkforceRPCServiceGrpc.OfficeWorkforceRPCServiceBlockingStub workforceStub,
        WorkforcePersonCacheService workforcePersonCacheService
    ) {
        this.workforceStub = workforceStub;
        this.workforcePersonCacheService = workforcePersonCacheService;
    }

    @Override
    public Optional<PersonSummaryDTO> getPersonByUid(UUID personUid) {
        if (personUid == null) return Optional.empty();

        // 1. Thread-safe self-populating cache lookup: fetches from Caffeine, OR runs gRPC loader on miss
        PersonSummaryDTO cached = workforcePersonCacheService.findByKeyOrLoad(personUid, () -> {
            try {
                OfficePersonRequest request = OfficePersonRequest.newBuilder()
                    .setUid(personUid.toString())
                    .build();
                OfficePersonResponse response = workforceStub.getPersonByUid(request);
                return PersonSummaryDTO.builder()
                    .uid(UUID.fromString(response.getUid()))
                    .nameEnglish(response.getNameEnglish())
                    .nameChinese(response.getNameChinese())
                    .mobileTel(response.getMobileTel())
                    .officeTel(response.getOfficeTel())
                    .email(response.getEmail())
                    .hkId(response.getHkId())
                    .isActive(response.getIsActive())
                    .build();
            } catch (StatusRuntimeException e) {
                log.warn("gRPC getPersonByUid call failed for UID {}: {}", personUid, e.getStatus());
                return null;
            } catch (Exception e) {
                log.error("Unexpected error resolving person for UID {}: {}", personUid, e.getMessage(), e);
                return null;
            }
        });

        return Optional.ofNullable(cached);
    }

    @Override
    public boolean isPersonActive(UUID personUid) {
        if (personUid == null) return false;

        Optional<PersonSummaryDTO> cached = getPersonByUid(personUid);
        if (cached.isPresent()) {
            return Boolean.TRUE.equals(cached.get().getIsActive());
        }

        try {
            OfficePersonRequest request = OfficePersonRequest.newBuilder()
                .setUid(personUid.toString())
                .build();
            OfficePersonActiveResponse response = workforceStub.verifyPersonActive(request);
            return response.getIsActive();
        } catch (StatusRuntimeException e) {
            log.warn("gRPC verifyPersonActive call failed for UID {}: {}", personUid, e.getStatus());
            return false;
        }
    }
}
```

---

## 6. Entity Manager Cache Pattern (`docs/AppUserManagerService_WithCacheExample.md`)

When local database entities are cached in memory (such as `Vehicle` in `transport-service` or `Person` in `workforce-service`), the ManagerService overrides entity lifecycle methods to maintain atomic synchronization and prevent cache leaks:

```java
@Service
@Transactional
public class VehicleManagerService extends AbstractBaseService<Vehicle, Long> {

    private final VehicleRepository vehicleRepository;
    private final VehicleCacheService vehicleCacheService;
    private final VehicleMapper vehicleMapper;

    @Autowired
    public VehicleManagerService(
        VehicleRepository vehicleRepository,
        VehicleCacheService vehicleCacheService,
        VehicleMapper vehicleMapper
    ) {
        super(vehicleRepository, "Vehicle");
        this.vehicleRepository = vehicleRepository;
        this.vehicleCacheService = vehicleCacheService;
        this.vehicleMapper = vehicleMapper;
    }

    // --- READS ---
    @Override
    @Transactional(readOnly = true)
    public Vehicle findById(Long id) {
        // Automatically fetches from Caffeine cache, OR queries DB + populates cache!
        VehicleDTO dto = vehicleCacheService.findByIdOrLoad(id, () -> {
            Vehicle dbEntity = super.findById(id); // Throws ResourceNotFoundException if missing
            return vehicleMapper.toDTO(dbEntity);
        });

        return convertToEntity(dto);
    }

    public Vehicle findByUid(UUID uid) {
        VehicleDTO dto = vehicleCacheService.findByKeyOrLoad(uid, () -> {
            Vehicle dbEntity = vehicleRepository.findByUid(uid)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found by UID: " + uid));
            return vehicleMapper.toDTO(dbEntity);
        });

        return convertToEntity(dto);
    }

    // --- WRITES & MUTATIONS ---
    @Override
    public Vehicle save(Vehicle entity) {
        Vehicle saved = super.save(entity);
        VehicleDTO dto = vehicleMapper.toDTO(saved);
        vehicleCacheService.save(saved.getId(), dto);
        if (saved.getUid() != null) {
            vehicleCacheService.save(saved.getUid(), dto);
        }
        return saved;
    }

    @Override
    public void delete(Vehicle entity) {
        super.delete(entity);
        if (entity.getId() != null) vehicleCacheService.delete(entity.getId());
        if (entity.getUid() != null) vehicleCacheService.delete(entity.getUid());
    }

    // CRITICAL: Overriding deleteById, deleteAllByIds, deleteAll to prevent cache leaks
    @Override
    public void deleteById(Long id) {
        Vehicle existing = super.findById(id);
        super.deleteById(id);
        vehicleCacheService.delete(id);
        if (existing != null && existing.getUid() != null) {
            vehicleCacheService.delete(existing.getUid());
        }
    }

    @Override
    public void deleteAllByIds(List<Long> ids) {
        super.deleteAllByIds(ids);
        ids.forEach(vehicleCacheService::delete);
    }

    @Override
    public void deleteAll(List<Vehicle> entities) {
        super.deleteAll(entities);
        entities.forEach(e -> {
            if (e.getId() != null) vehicleCacheService.delete(e.getId());
            if (e.getUid() != null) vehicleCacheService.delete(e.getUid());
        });
    }

    private Vehicle convertToEntity(VehicleDTO dto) {
        // Maps cached DTO back to Entity
        ...
    }
}
```

---

## 7. Cache Eviction & Fallback Policy

1. **In-Memory TTL & Bounds**:
   - Cache TTL is fixed at **10 minutes** (`expireAfterWrite(Duration.ofMinutes(10))`).
   - Maximum cache size: **5,000 entries** with LRU eviction on saturation.
2. **Atomic Self-Populating Loader**:
   - `findByKeyOrLoad(key, loader)` uses Caffeine's atomic loader lock under the hood. Multiple concurrent requests for the same un-cached `personUid` block on the single first loader invocation, eliminating downstream stampede traffic.
3. **Graceful Fallback on Downstream Outage**:
   - If `workforce-service` gRPC is down or returns `UNAVAILABLE`, the client catches `StatusRuntimeException`, logs a warning, and returns `Optional.empty()` without crashing `transport-service`.
   - The vehicle record is still returned with `owner = null` or flagged as unverified.
4. **Cross-Service Cache Eviction**:
   - When a person is mutated or soft-deleted in `workforce-service`, a Kafka event (`OFFICE_PERSON_CHANGED`) or gRPC push triggers `workforcePersonCacheService.delete(personUid)` in `transport-service`, ensuring zero stale reads across service boundaries.
