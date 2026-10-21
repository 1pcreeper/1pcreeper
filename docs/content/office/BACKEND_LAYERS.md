# Office Enterprise System — Backend Layered Architecture Guidelines

This document outlines the strict layered architecture, design patterns, and engineering guidelines for all backend microservices in the **Office** project (`backend/office/*` and `backend/shared/*`).

---

## 1. Architectural Philosophy & Layered Flow

Every endpoint in an Office microservice follows a strict, unidirectional execution pipeline:

```
[ HTTP Request ]
       │
       ▼
┌────────────────────────────────────────────────────────┐
│  1. Controller (controller.common.XXXXController)      │
│     - Route mapping & parameter binding                │
│     - Security & role authorization (@Secured)         │
│     - Delegates directly & exclusively to CommonService│
└───────────────────────┬────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────┐
│  2. Common Service (service.common.XXXXService)        │
│     - Master orchestrator for endpoint use-cases       │
│     - Coordinates @Transactional boundaries            │
│     - Calls Checker Services for validations           │
│     - Calls Manager Services for entity operations     │
│     - Calls external / gRPC clients (if applicable)    │
│     - Calls Mappers to assemble response models        │
└───────┬──────────────────────────┬─────────────────────┘
        │                          │
        ▼                          ▼
┌───────────────────────┐  ┌──────────────────────────────────┐
│  3. Checker Service   │  │  4. Manager Service              │
│  (service.checker.*)  │  │  (service.manager.*)             │
│  - Validates DTOs,    │  │  - Low-level entity CRUD/queries │
│    entities, states   │  │  - Extends AbstractBaseService   │
│  - Throws exceptions  │  │  - ONLY depends on Repositories  │
│    if invalid         │  │  - NO dependency on Common/      │
│  - Returns void if OK │  │    Checker services              │
└───────────────────────┘  └───────────────┬──────────────────┘
                                           │
                                           ▼
                           ┌──────────────────────────────────┐
                           │  5. Entity Repository            │
                           │  (repository.*)                  │
                           │  - Spring Data JPA / PostgreSQL  │
                           └──────────────────────────────────┘
                                           │
                                           ▼
┌────────────────────────────────────────────────────────┐
│  6. Mappers (mapper.XXXXMapper)                        │
│     - Entity <-> RequestDTO / ResponseDTO translation  │
└───────────────────────┬────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────┐
│  7. API Base Response                                  │
│     - Returns APIBaseResponseDTO<T> with HTTP 200/201  │
│     - Exceptions caught by GlobalExceptionAdvice       │
└────────────────────────────────────────────────────────┘
```

### Strict Architectural Invariants

| Layer | Can Call | MUST NOT Call | Responsibility |
|---|---|---|---|
| **Controller** | `CommonService` | `CheckerService`, `ManagerService`, `Repository`, `Mapper` | Routing, authorization, unwrapping requests, delegating to common service |
| **Common Service** | `CheckerService`, `ManagerService`, `Mapper`, external clients/stubs | `Controller`, other domain `CommonService` directly (avoid circular loops) | Orchestrating workflow for the endpoint, transaction control |
| **Checker Service** | `Repository` or `ManagerService` (read-only checks), helper utilities | `CommonService`, `Controller`, entity persistence methods | Validation assertion; throws exception or returns `void` |
| **Manager Service** | `Repository`, `AbstractBaseRepository` | `CommonService`, `CheckerService`, `Controller` | Pure entity lifecycle and repository abstraction |
| **Mapper** | Model utilities | Services, Repositories, Controllers | Pure object-to-object transformation |

---

## 2. Layer Specifications & Concrete Patterns

### Layer 1: Controller (`controller.common.XXXXController.java`)

Controllers act exclusively as the entry gateway for HTTP requests. They do not contain business rules, validation branches, or direct entity manipulation.

#### Guidelines
1. **Delegation**: Only calls methods on `service.common.XXXXService`.
2. **Security**: Annotates access control via `@Secured` using constants from `UserRoles` or `Roles`.
3. **Response Packaging**: Always returns `ResponseEntity<APIBaseResponseDTO<T>>`.
4. **Validation Trigger**: Uses `@Valid` on request bodies to trigger JSR-380 field-level constraints.

#### Example: `VehicleController.java`
```java
package project.office_transport_service.controller.common;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import project.office_transport_service.model.dto.request.VehicleCreateRequestDTO;
import project.office_transport_service.model.dto.request.VehicleUpdateRequestDTO;
import project.office_transport_service.model.dto.response.VehicleResponseDTO;
import project.office_transport_service.service.common.VehicleService;
import project.shared_office_common_lib.constant.role.Roles;
import project.shared_office_starter.model.dto.base.APIBaseResponseDTO;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

import java.util.UUID;

@RestController
@RequestMapping("/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    @Autowired
    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @Secured({Roles.OFFICE_ADMIN, Roles.OFFICE_USER})
    @GetMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<VehicleResponseDTO>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(vehicleService.findById(id)));
    }

    @Secured({Roles.OFFICE_ADMIN, Roles.OFFICE_USER})
    @GetMapping("/uid/{uid}")
    public ResponseEntity<APIBaseResponseDTO<VehicleResponseDTO>> findByUid(@PathVariable UUID uid) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(vehicleService.findByUid(uid)));
    }

    @Secured({Roles.OFFICE_ADMIN})
    @PostMapping
    public ResponseEntity<APIBaseResponseDTO<VehicleResponseDTO>> create(
        @Valid @RequestBody VehicleCreateRequestDTO requestDTO
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(vehicleService.create(requestDTO)));
    }

    @Secured({Roles.OFFICE_ADMIN})
    @PutMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<VehicleResponseDTO>> update(
        @PathVariable Long id,
        @Valid @RequestBody VehicleUpdateRequestDTO requestDTO
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(vehicleService.update(id, requestDTO)));
    }

    @Secured({Roles.OFFICE_ADMIN, Roles.OFFICE_USER})
    @GetMapping
    public ResponseEntity<APIBaseResponseDTO<PaginationBaseResponseDTO<VehicleResponseDTO>>> findAll(
        @PageableDefault Pageable pageable
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(vehicleService.findAll(pageable)));
    }
}
```

---

### Layer 2: Common Service (`service.common.XXXXService.java`)

Common Services are the business orchestrators of the application. Each public method corresponds directly to a use case or endpoint workflow.

#### Guidelines
1. **Flow Execution**:
   - Step 1: Call `CheckerService` to validate input DTOs.
   - Step 2: Fetch existing entity via `ManagerService`.
   - Step 3: Call `CheckerService` to validate entity state (e.g. `isActive`, permissions, lifecycle state).
   - Step 4: Perform domain mutation or map DTO to entity via `Mapper`.
   - Step 5: Save through `ManagerService`.
   - Step 6: Map to Response DTO via `Mapper` and return.
2. **Transaction Demarcation**: Annotate state-changing methods with `@Transactional`.
3. **No Direct HTTP**: Common Services return DTOs (e.g. `VehicleResponseDTO`), never HTTP headers or `ResponseEntity`.

#### Example: `VehicleService.java`
```java
package project.office_transport_service.service.common;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.office_transport_service.mapper.VehicleMapper;
import project.office_transport_service.model.dto.request.VehicleCreateRequestDTO;
import project.office_transport_service.model.dto.request.VehicleUpdateRequestDTO;
import project.office_transport_service.model.dto.response.VehicleResponseDTO;
import project.office_transport_service.model.entity.Vehicle;
import project.office_transport_service.service.checker.VehicleCheckerService;
import project.office_transport_service.service.manager.VehicleManagerService;
import project.shared_office_starter.mapper.PaginationMapper;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

import java.util.UUID;

@Service
public class VehicleService {

    private final VehicleManagerService vehicleManagerService;
    private final VehicleCheckerService vehicleCheckerService;
    private final VehicleMapper vehicleMapper;
    private final PaginationMapper paginationMapper;

    @Autowired
    public VehicleService(
        VehicleManagerService vehicleManagerService,
        VehicleCheckerService vehicleCheckerService,
        VehicleMapper vehicleMapper,
        PaginationMapper paginationMapper
    ) {
        this.vehicleManagerService = vehicleManagerService;
        this.vehicleCheckerService = vehicleCheckerService;
        this.vehicleMapper = vehicleMapper;
        this.paginationMapper = paginationMapper;
    }

    public VehicleResponseDTO findById(Long id) {
        Vehicle vehicle = vehicleManagerService.findById(id);
        vehicleCheckerService.checkVehicleIsActive(vehicle);
        return vehicleMapper.toResponseDTO(vehicle);
    }

    public VehicleResponseDTO findByUid(UUID uid) {
        Vehicle vehicle = vehicleManagerService.findByUid(uid);
        vehicleCheckerService.checkVehicleIsActive(vehicle);
        return vehicleMapper.toResponseDTO(vehicle);
    }

    @Transactional
    public VehicleResponseDTO create(VehicleCreateRequestDTO requestDTO) {
        // 1. Validate DTO business rules & uniqueness
        vehicleCheckerService.checkCreateRequest(requestDTO);

        // 2. Map request to entity
        Vehicle newVehicle = vehicleMapper.toEntity(requestDTO);

        // 3. Persist entity via manager
        Vehicle savedVehicle = vehicleManagerService.save(newVehicle);

        // 4. Return mapped response DTO
        return vehicleMapper.toResponseDTO(savedVehicle);
    }

    @Transactional
    public VehicleResponseDTO update(Long id, VehicleUpdateRequestDTO requestDTO) {
        // 1. Retrieve entity
        Vehicle existingVehicle = vehicleManagerService.findById(id);

        // 2. Validate current state and update eligibility
        vehicleCheckerService.checkVehicleIsActive(existingVehicle);
        vehicleCheckerService.checkUpdateRequest(id, requestDTO);

        // 3. Mutate entity via mapper
        vehicleMapper.updateEntity(requestDTO, existingVehicle);

        // 4. Persist updated entity
        Vehicle savedVehicle = vehicleManagerService.save(existingVehicle);

        return vehicleMapper.toResponseDTO(savedVehicle);
    }

    public PaginationBaseResponseDTO<VehicleResponseDTO> findAll(Pageable pageable) {
        return paginationMapper.toDTO(
            vehicleManagerService.findAllByIsActive(true, pageable),
            vehicleMapper::toResponseDTO
        );
    }
}
```

---

### Layer 3: Checker Service (`service.checker.XXXXCheckerService.java`)

Checker Services encapsulate validation logic, business invariants, and semantic integrity checks.

#### Guidelines
1. **Pure Assertion Contract**:
   - If conditions are valid: Return `void`.
   - If conditions are invalid: Throw the appropriate domain exception directly.
2. **Encapsulation & Reusability**: Common rules (e.g., verifying an entity is active, checking unique license plates, verifying phone/email formats) are encapsulated once in a Checker Service and called by multiple methods in `CommonService`.
3. **No Mutations**: Checker Services must never modify entity states or call write operations on repositories.

#### Standard Exception Mappings
Checker Services throw exceptions managed by `project.shared_office_starter.advice.GlobalExceptionAdvice`:

| Exception Class | Trigger Condition | Resulting HTTP Status |
|---|---|---|
| `ResourceNotFoundException` | Entity missing or soft-deleted when required active | `404 Not Found` |
| `PropertyValidationException` | Duplicate unique constraint, invalid business value format | `400 Bad Request` |
| `IllegalArgumentException` | Null/empty parameter violations | `400 Bad Request` |
| `UnAuthorizedException` | User not authenticated or missing valid token | `401 Unauthorized` |
| `PrincipalException` | Operation forbidden for the current actor role | `403 Forbidden` |
| `DatabaseUpdateFailureException` | Database integrity violation or concurrent conflict | `422 Unprocessable Entity` |

#### Example: `VehicleCheckerService.java`
```java
package project.office_transport_service.service.checker;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import project.office_transport_service.model.dto.request.VehicleCreateRequestDTO;
import project.office_transport_service.model.dto.request.VehicleUpdateRequestDTO;
import project.office_transport_service.model.entity.Vehicle;
import project.office_transport_service.repository.VehicleRepository;
import project.shared_office_starter.model.exception.PropertyValidationException;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

@Service
public class VehicleCheckerService {

    private final VehicleRepository vehicleRepository;

    @Autowired
    public VehicleCheckerService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    /**
     * Asserts that a vehicle exists and is marked active (not soft deleted).
     */
    public void checkVehicleIsActive(Vehicle vehicle) {
        if (vehicle == null || Boolean.FALSE.equals(vehicle.getIsActive())) {
            throw new ResourceNotFoundException("Vehicle not found or has been deactivated.");
        }
    }

    /**
     * Asserts that vehicle creation payload satisfies business rules.
     */
    public void checkCreateRequest(VehicleCreateRequestDTO dto) {
        if (dto.getPlateNumber() == null || dto.getPlateNumber().isBlank()) {
            throw new PropertyValidationException("Plate number must not be blank.");
        }

        if (vehicleRepository.existsByPlateNumber(dto.getPlateNumber().trim())) {
            throw new PropertyValidationException(
                "Vehicle with plate number " + dto.getPlateNumber() + " already exists."
            );
        }

        if (dto.getVin() != null && !dto.getVin().isBlank()) {
            if (dto.getVin().length() != 17) {
                throw new PropertyValidationException("VIN must be exactly 17 characters.");
            }
            if (vehicleRepository.existsByVin(dto.getVin().trim())) {
                throw new PropertyValidationException("Vehicle with VIN " + dto.getVin() + " already exists.");
            }
        }
    }

    /**
     * Asserts that vehicle update payload does not conflict with existing records.
     */
    public void checkUpdateRequest(Long currentId, VehicleUpdateRequestDTO dto) {
        if (dto.getPlateNumber() != null && !dto.getPlateNumber().isBlank()) {
            vehicleRepository.findByPlateNumber(dto.getPlateNumber().trim())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(currentId)) {
                        throw new PropertyValidationException(
                            "Another vehicle already holds plate number " + dto.getPlateNumber()
                        );
                    }
                });
        }
    }
}
```

---

### Layer 4: Manager Service (`service.manager.XXXXManagerService.java`)

Manager Services provide a clean abstraction for entity CRUD, custom queries, and data-layer persistence.

#### Guidelines
1. **Dependency Isolation**:
   - **MUST ONLY** depend on entity repositories (e.g. `VehicleRepository`).
   - **MUST NOT** depend on `CommonService`, `CheckerService`, or `Controller`.
2. **Inheritance**: Extends `AbstractBaseService<Entity, ID>` from `service.base.AbstractBaseService` to inherit standard queries (`findById`, `findAll`, `save`, `delete`).
3. **No High-Level Business Rules**: Does not decide whether an operation is allowed; it executes data retrieval and storage faithfully.

#### Example: `VehicleManagerService.java`
```java
package project.office_transport_service.service.manager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import project.office_transport_service.model.entity.Vehicle;
import project.office_transport_service.repository.VehicleRepository;
import project.office_transport_service.service.base.AbstractBaseService;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

import java.util.Optional;
import java.util.UUID;

@Service
public class VehicleManagerService extends AbstractBaseService<Vehicle, Long> {

    private final VehicleRepository vehicleRepository;

    @Autowired
    public VehicleManagerService(VehicleRepository vehicleRepository) {
        super(vehicleRepository, "Vehicle");
        this.vehicleRepository = vehicleRepository;
    }

    public Vehicle findByUid(UUID uid) {
        return vehicleRepository.findByUid(uid)
            .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found by UID: " + uid));
    }

    public Page<Vehicle> findAllByIsActive(Boolean isActive, Pageable pageable) {
        return vehicleRepository.findAllByIsActive(isActive, pageable);
    }

    public Page<Vehicle> findByPersonUid(UUID personUid, Pageable pageable) {
        return vehicleRepository.findByPersonUidAndIsActive(personUid, true, pageable);
    }

    public Optional<Vehicle> findByPlateNumber(String plateNumber) {
        return vehicleRepository.findByPlateNumber(plateNumber);
    }
}
```

---

### Layer 5: Mapper (`mapper.XXXXMapper.java`)

Mappers decouple internal JPA entities from external API contracts.

#### Guidelines
1. **Mapping Types**:
   - `toEntity(CreateRequestDTO)`: Builds new JPA Entity.
   - `updateEntity(UpdateRequestDTO, Entity)`: Mutates existing JPA Entity.
   - `toResponseDTO(Entity)`: Transforms JPA Entity into `ResponseDTO`.
   - `toDTO(Entity)`: Transforms JPA Entity into internal domain `ObjectDTO`.
2. **Separation of Concerns**: Prevents entity internal fields (e.g., internal sequence IDs, password hashes, DB version columns) from leaking to client interfaces.

#### Example: `VehicleMapper.java`
```java
package project.office_transport_service.mapper;

import org.springframework.stereotype.Component;
import project.office_transport_service.model.dto.request.VehicleCreateRequestDTO;
import project.office_transport_service.model.dto.request.VehicleUpdateRequestDTO;
import project.office_transport_service.model.dto.response.VehicleResponseDTO;
import project.office_transport_service.model.entity.Vehicle;

import java.util.UUID;

@Component
public class VehicleMapper {

    public Vehicle toEntity(VehicleCreateRequestDTO request) {
        Vehicle vehicle = new Vehicle();
        vehicle.setUid(UUID.randomUUID());
        vehicle.setPlateNumber(request.getPlateNumber().trim().toUpperCase());
        vehicle.setVin(request.getVin() != null ? request.getVin().trim().toUpperCase() : null);
        vehicle.setMake(request.getMake());
        vehicle.setModel(request.getModel());
        vehicle.setYear(request.getYear());
        vehicle.setColor(request.getColor());
        vehicle.setVehicleType(request.getVehicleType());
        vehicle.setPersonUid(request.getPersonUid());
        vehicle.setIsActive(true);
        return vehicle;
    }

    public void updateEntity(VehicleUpdateRequestDTO request, Vehicle entity) {
        if (request.getPlateNumber() != null) {
            entity.setPlateNumber(request.getPlateNumber().trim().toUpperCase());
        }
        if (request.getVin() != null) {
            entity.setVin(request.getVin().trim().toUpperCase());
        }
        if (request.getMake() != null) entity.setMake(request.getMake());
        if (request.getModel() != null) entity.setModel(request.getModel());
        if (request.getYear() != null) entity.setYear(request.getYear());
        if (request.getColor() != null) entity.setColor(request.getColor());
        if (request.getVehicleType() != null) entity.setVehicleType(request.getVehicleType());
        if (request.getPersonUid() != null) entity.setPersonUid(request.getPersonUid());
        if (request.getIsActive() != null) entity.setIsActive(request.getIsActive());
    }

    public VehicleResponseDTO toResponseDTO(Vehicle entity) {
        VehicleResponseDTO dto = new VehicleResponseDTO();
        dto.setId(entity.getId());
        dto.setUid(entity.getUid());
        dto.setPlateNumber(entity.getPlateNumber());
        dto.setVin(entity.getVin());
        dto.setMake(entity.getMake());
        dto.setModel(entity.getModel());
        dto.setYear(entity.getYear());
        dto.setColor(entity.getColor());
        dto.setVehicleType(entity.getVehicleType());
        dto.setPersonUid(entity.getPersonUid());
        dto.setIsActive(entity.getIsActive());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}
```

---

## 3. Package & Directory Structure Convention

Across all Office backend services (`workforce-service`, `transport-service`, `account-service`, `expenditure-service`), packages adhere to this standard layout:

```
project.office_XXXXX_service/   # (e.g., project.office_account_service, project.office_transport_service)
│
├── config/                     # Spring configurations (Security, gRPC, Async)
├── constant/                   # Service-level constants & roles
├── controller/
│   └── common/                 # Endpoint controllers (PersonController, VehicleController)
├── mapper/                     # Model mappers (Entity <-> DTO)
├── model/
│   ├── dto/
│   │   ├── request/            # Request payloads (*RequestDTO)
│   │   ├── response/           # Response payloads (*ResponseDTO)
│   │   └── object/             # Domain POJOs (*DTO)
│   └── entity/                 # JPA Entities (extends AbstractAuditableEntity)
├── repository/                 # Spring Data JPA repositories
└── service/
    ├── base/                   # AbstractBaseService
    ├── checker/                # Checker services (*CheckerService) -> Validations & Assertions
    ├── common/                 # Common services (*Service) -> Orchestrators
    ├── grpc/                   # gRPC server services (*GrpcServiceImpl with @GrpcService)
    └── manager/                # Manager services (*ManagerService) -> Entity CRUD
```

---

## 4. Refactoring & Migration Plan

### Step 1: `office-workforce-service` Refactoring
- **Extract Checkers**: Migrate inline validation code currently in `PersonService.java`, `CompanyService.java`, and `StaffService.java` into dedicated checker classes:
  - `PersonCheckerService.java` (assert active, validate unique identity/email).
  - `CompanyCheckerService.java` (assert company active, registration codes).
  - `StaffCheckerService.java` (assert non-overlapping assignments, valid department).
- **Clean Managers**: Remove business checks from `PersonManagerService.java` (such as email regex checks) and place them in `PersonCheckerService.java` to ensure `ManagerService` only handles repository operations.

### Step 2: `office-transport-service` Implementation
- Build all new domain models for vehicles and VRD documents directly conforming to the 5-layer pattern:
  - `VehicleController` -> `VehicleService` -> `VehicleCheckerService` + `VehicleManagerService` -> `VehicleMapper`
  - `VrdDocumentController` -> `VrdDocumentService` -> `VrdDocumentCheckerService` + `VrdDocumentManagerService` -> `VrdDocumentMapper`
- Integrate gRPC client calls (`WorkforceDirectoryClient`) inside `service.common.VehicleService` via UID linking.

---

## 5. Verification Checklist

Before submitting PRs or writing code for Office microservice endpoints, verify:

- [ ] Does the Controller only inject and call `service.common.XXXXService`?
- [ ] Are all controller return types wrapped in `ResponseEntity<APIBaseResponseDTO<T>>`?
- [ ] Does the Common Service delegate validation to a `service.checker.XXXXCheckerService`?
- [ ] Do Checker Service methods return `void` or throw a specific exception?
- [ ] Does the Manager Service depend **only** on JPA repositories without referencing Common/Checker services?
- [ ] Are entity/DTO translations isolated within `mapper.XXXXMapper`?
- [ ] Does the endpoint test verify proper 200/400/404 responses mapped by `GlobalExceptionAdvice`?
