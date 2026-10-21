# Office Enterprise System — Abstraction & Interface Plan

## 1. Core Architectural Boundaries

To maintain high decoupling, clean testing, and rapid local iteration, business services must not be tightly coupled to specific storage providers, external OCR engines, or inter-service transport layers.

| Interface | Responsibility | Local Development Adapter | Production Adapter | Boundary Rationale |
|---|---|---|---|---|
| `WorkforceDirectoryClient` | Resolve Person by `uid UUID`; verify driver eligibility | `CachedWorkforceDirectoryClient` | `GrpcWorkforceDirectoryClient` | `transport-service` must not query `workforce_db` directly |
| `DocumentStorageService` | Save, read, delete, and stat VRD scans, avatars, and staging | `LocalFileDocumentStorageService` (disk `/data/local/office/transport-service/`) | `LocalFileDocumentStorageService` (disk `/data/local/office/transport-service/`) | Centralized on local storage; MinIO eliminated. Graceful handling of missing files with warning signal |
| `VehicleExplorerStorageService` | Pure file system directory and file management | `LocalVehicleExplorerStorageService` (`/data/local/office/transport-service/vehicles/{uid}/explorer`) | `LocalVehicleExplorerStorageService` (`/data/local/office/transport-service/vehicles/{uid}/explorer`) | Pure file system: files and folders are NOT tracked in DB |
| `VrdOcrExtractionService` | Extract structured key-values from raw vehicle documents | `SimulatedVrdOcrExtractionService` | `GeminiVrdOcrExtractionService` (or Cloud Vision) | OCR algorithms and prompt evolution must not pollute entity persistence |
| `UserDirectorySyncClient` | Sync global accounts and roles into local `users` table | In-process cache / DB sync | `GrpcAccountDirectoryClient` | Local auditing FKs depend on mirrored `users` |

---

## 2. Workforce Directory Client (gRPC UID Linking)

The `transport-service` references vehicle owners exclusively through `person_uid UUID`.

### Interface Definition
```java
package project.office_transport_service.service.client;

import project.office_transport_service.model.dto.client.PersonSummaryDTO;
import java.util.Optional;
import java.util.UUID;

public interface WorkforceDirectoryClient {
    /**
     * Resolves Person details by stable cross-service UID.
     */
    Optional<PersonSummaryDTO> getPersonByUid(UUID personUid);

    /**
     * Checks if a Person is currently active and eligible as a vehicle custodian.
     */
    boolean isPersonActive(UUID personUid);
}
```

### Production gRPC Implementation
```java
@Service
@Profile("!test")
public class GrpcWorkforceDirectoryClient implements WorkforceDirectoryClient {
    private final OfficeWorkforceRPCServiceGrpc.OfficeWorkforceRPCServiceBlockingStub workforceStub;
    private final Cache<UUID, PersonSummaryDTO> personCache;

    @Autowired
    public GrpcWorkforceDirectoryClient(
        OfficeWorkforceRPCServiceGrpc.OfficeWorkforceRPCServiceBlockingStub workforceStub
    ) {
        this.workforceStub = workforceStub;
        this.personCache = Caffeine.newBuilder()
            .expireAfterWrite(Duration.ofMinutes(10))
            .maximumSize(5000)
            .build();
    }

    @Override
    public Optional<PersonSummaryDTO> getPersonByUid(UUID personUid) {
        PersonSummaryDTO cached = personCache.getIfPresent(personUid);
        if (cached != null) return Optional.of(cached);

        try {
            OfficePersonResponse response = workforceStub.getPersonByUid(
                OfficePersonRequest.newBuilder().setUid(personUid.toString()).build()
            );
            PersonSummaryDTO dto = mapFromProto(response);
            personCache.put(personUid, dto);
            return Optional.of(dto);
        } catch (StatusRuntimeException e) {
            if (e.getStatus().getCode() == Status.Code.NOT_FOUND) {
                return Optional.empty();
            }
            throw new ResourceNotFoundException("Workforce service unavailable: " + e.getMessage());
        }
    }
}
```

---

## 3. Storage Abstractions (VRDs, Avatars, Staging, and Pure Filesystem Explorer)

Since MinIO is eliminated, all document and asset persistence is standardized on the local filesystem rooted at `/data/local/office/transport-service/`.

### 3.1 Document Storage Service (VRDs, Avatars, Staging)
```java
package project.office_transport_service.service.storage;

import project.office_transport_service.model.dto.storage.StoredDocumentDTO;
import java.io.InputStream;
import java.util.Optional;

public interface DocumentStorageService {
    StoredDocumentDTO put(String relativeKey, InputStream content, String mediaType, long contentLength);
    Optional<InputStream> read(String relativeKey);
    StoredDocumentDTO stat(String relativeKey);
    boolean delete(String relativeKey);
}
```

#### Exception Handling & Warning Signal Protocol
When reading or stating files (`vrds`, `avatar`, `staging`), if the target file disappeared or was renamed on disk:
- Catch `NoSuchFileException`, `FileNotFoundException`, and `IOException`.
- **Do not propagate the exception** as a fatal 500 error.
- Return a `StoredDocumentDTO` marked with `isAccessible = false` and warning flags:
```java
// LocalFileDocumentStorageService.java snippet:
public StoredDocumentDTO stat(String relativeKey) {
    Path targetPath = resolveSafely(relativeKey);
    if (!Files.exists(targetPath)) {
        log.warn("Storage warning: File disappeared or missing on disk: {}", relativeKey);
        return StoredDocumentDTO.builder()
            .relativeKey(relativeKey)
            .isAccessible(false)
            .warningSignal("FILE_NOT_FOUND")
            .warningMessage("File is no longer accessible on disk")
            .build();
    }
    // Normal metadata extraction...
}
```

### 3.2 Vehicle Explorer Pure Filesystem Abstraction
Explorer documents and folders are **never recorded in the database**; they live directly at `/data/local/office/transport-service/vehicles/{vehicleUid}/explorer`.

```java
package project.office_transport_service.service.storage;

import project.office_transport_service.model.dto.explorer.ExplorerItemDTO;
import java.io.InputStream;
import java.util.List;
import java.util.UUID;

public interface VehicleExplorerStorageService {
    List<ExplorerItemDTO> listDirectory(UUID vehicleUid, String relativeFolder);
    ExplorerItemDTO createFolder(UUID vehicleUid, String parentFolder, String folderName);
    ExplorerItemDTO saveFile(UUID vehicleUid, String destinationFolder, String fileName, InputStream stream, long byteSize);
    boolean deleteItem(UUID vehicleUid, String relativePath);
    ExplorerItemDTO moveOrRename(UUID vehicleUid, String sourcePath, String targetPath);
    Optional<InputStream> readFile(UUID vehicleUid, String relativePath);
}
```

#### Pure Filesystem Implementation Rules
- **No DB Table**: Zero database entities or repositories for explorer items.
- **Directory Traversal Protection**: Rejects `..`, null bytes, and path traversal outside the vehicle's `explorer/` directory.
- **Resilience Against Missing/Renamed Folders**: If an operator or process renames or removes a directory, `listDirectory` catches filesystem errors gracefully, creates missing default directories if required, and annotates broken symlinks/inaccessible items with `isAccessible: false` and `warningSignal: "FOLDER_OR_FILE_UNAVAILABLE"`.

---

## 4. VRD OCR Extraction Abstraction

Extracts structured data from Hong Kong Vehicle Registration Documents:
- License Plate / Registration Mark
- Registered Owner Name
- Chassis Number / VIN
- Engine Number & Cylinder Capacity
- First Registration Date & Document Expiry Date

### Interface Definition
```java
package project.office_transport_service.service.ocr;

import project.office_transport_service.model.dto.ocr.VrdOcrResultDTO;
import java.io.InputStream;

public interface VrdOcrExtractionService {
    /**
     * Parses an uploaded image/PDF stream and extracts structured VRD fields.
     */
    VrdOcrResultDTO extractVrdData(InputStream documentStream, String mediaType);
}
```

---

## 5. Persistence Layer Abstraction

All microservices adhere to the generic repository and manager pattern:

1. **`AbstractBaseRepository<T, ID>`**:
   Extends `JpaRepository<T, ID>` and `JpaSpecificationExecutor<T>`, exposing standard paging, filtering, and transactional queries.
2. **`AbstractBaseService<T, ID>`**:
   Base class for all `*ManagerService` implementations, enforcing consistent error messages (`ResourceNotFoundException(entityName + " Not Found")`).
3. **Mappers**:
   Spring `@Component` mappers implementing null-safe transforms and whitespace normalization (`emptyToNull`), ensuring clear boundaries between entities and DTOs.
