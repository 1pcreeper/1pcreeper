# Office Enterprise System — gRPC Communication & Service Architecture

This document serves as the comprehensive architectural guide and standard operating procedure for all **gRPC** inter-service communication across the **Office** microservices ecosystem (`backend/office/*` and `backend/shared/office-starter`).

---

## 1. Overview & Architecture Principles

In the Office project, microservices (`account-service`, `workforce-service`, `transport-service`, `expenditure-service`) maintain strictly isolated databases (Database-per-Service pattern). Direct SQL queries across databases and foreign keys between schemas are prohibited.

Inter-service communication is partitioned by use case:
- **Client (Frontend) to Backend**: HTTPS REST via Spring Cloud Gateway (`office-api-gateway`) returning `APIBaseResponseDTO<T>`.
- **Backend to Backend (Synchronous / Query / Verification)**: High-performance, binary **gRPC over HTTP/2** using Eureka service discovery, dynamic port resolution, and resilient retry policies.
- **Backend to Backend (Asynchronous / Events)**: Apache Kafka domain events (e.g., cache invalidation, audit trails).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             EUREKA REGISTRY                                 │
│                     (office-service-registry :8084)                         │
└──────────────▲───────────────────────────────────────────────▲──────────────┘
               │ Heartbeat / Registration                      │
               │                                               │
┌──────────────┴──────────────┐                 ┌──────────────┴──────────────┐
│  office-transport-service   │                 │  office-workforce-service   │
│                             │                 │                             │
│  [ GrpcStubConfig ]         │                 │  [ @GrpcService ]           │
│  - Eureka IP Resolution     │==== gRPC ======>│  - project.office_workforce │
│  - ManagedChannelBuilder    │   (HTTP/2)      │    _service.service.grpc.*  │
│  - BlockingStub Injection   │                 │  - StreamObserver<Response> │
└─────────────────────────────┘                 └─────────────────────────────┘
```

---

## 2. Server-Side gRPC Implementation Standards

Every microservice that exposes gRPC endpoints must follow strict packaging and implementation conventions.

### 2.1 Package & Annotation Convention
- **Package Path**: `package project.office_XXXXX_service.service.grpc;`
  - Here, `office_XXXXX_service` represents the exact corresponding microservice hosting the gRPC server:
    | Microservice Project | Server gRPC Package Name | Example gRPC Implementation Class |
    |---|---|---|
    | `backend/office/account-service` | `project.office_account_service.service.grpc` | `OfficeAccountGrpcServiceImpl` |
    | `backend/office/workforce-service` | `project.office_workforce_service.service.grpc` | `OfficeWorkforceGrpcServiceImpl` |
    | `backend/office/transport-service` | `project.office_transport_service.service.grpc` | `OfficeTransportGrpcServiceImpl` |
    | `backend/office/expenditure-service` | `project.office_expenditure_service.service.grpc` | `OfficeExpenditureGrpcServiceImpl` |
- **Spring Bean Annotation**: `@GrpcService` (from `net.devh.boot.grpc.server.service.GrpcService`)
- **Base Class**: Extends generated `MyServiceGrpc.MyServiceImplBase` (from `project.shared_office_starter.grpc.*`)
- **Method Signature**: Accepts Protobuf request model and `StreamObserver<ResponseModel>`

### 2.2 Template & Hello World Example

```java
package project.office_XXXXX_service.service.grpc; // e.g., project.office_account_service.service.grpc

import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import project.shared_office_starter.grpc.HelloReply;
import project.shared_office_starter.grpc.HelloRequest;
import project.shared_office_starter.grpc.MyServiceGrpc;

@GrpcService
public class MyServiceImpl extends MyServiceGrpc.MyServiceImplBase {

    @Override
    public void sayHello(HelloRequest request, StreamObserver<HelloReply> responseObserver) {
        HelloReply reply = HelloReply.newBuilder()
                .setMessage("Hello ==> " + request.getName())
                .build();
        responseObserver.onNext(reply);
        responseObserver.onCompleted();
    }
}
```

### 2.3 Concrete Enterprise Implementation: `OfficeWorkforceGrpcServiceImpl`

In `office-workforce-service`, the gRPC server allows `transport-service` to resolve Person details and verify driver eligibility using stable UUIDs:

```java
package project.office_workforce_service.service.grpc;

import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.beans.factory.annotation.Autowired;
import project.office_workforce_service.model.entity.Person;
import project.office_workforce_service.service.manager.PersonManagerService;
import project.shared_office_starter.grpc.OfficePersonActiveResponse;
import project.shared_office_starter.grpc.OfficePersonRequest;
import project.shared_office_starter.grpc.OfficePersonResponse;
import project.shared_office_starter.grpc.OfficeWorkforceRPCServiceGrpc;

import java.util.UUID;

@Slf4j
@GrpcService
public class OfficeWorkforceGrpcServiceImpl extends OfficeWorkforceRPCServiceGrpc.OfficeWorkforceRPCServiceImplBase {

    private final PersonManagerService personManagerService;

    @Autowired
    public OfficeWorkforceGrpcServiceImpl(PersonManagerService personManagerService) {
        this.personManagerService = personManagerService;
    }

    @Override
    public void getPersonByUid(OfficePersonRequest request, StreamObserver<OfficePersonResponse> responseObserver) {
        try {
            UUID personUid = UUID.fromString(request.getUid());
            Person person = personManagerService.findByUid(personUid);

            if (person == null) {
                responseObserver.onError(
                    Status.NOT_FOUND
                        .withDescription("Person not found with UID: " + request.getUid())
                        .asRuntimeException()
                );
                return;
            }

            OfficePersonResponse response = OfficePersonResponse.newBuilder()
                .setUid(person.getUid().toString())
                .setNameEnglish(person.getNameEnglish() != null ? person.getNameEnglish() : "")
                .setNameChinese(person.getNameChinese() != null ? person.getNameChinese() : "")
                .setMobileTel(person.getMobileTel() != null ? person.getMobileTel() : "")
                .setOfficeTel(person.getOfficeTel() != null ? person.getOfficeTel() : "")
                .setEmail(person.getEmail() != null ? person.getEmail() : "")
                .setHkId(person.getHkId() != null ? person.getHkId() : "")
                .setIsActive(Boolean.TRUE.equals(person.getIsActive()))
                .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (IllegalArgumentException e) {
            log.error("Invalid UUID format received: {}", request.getUid(), e);
            responseObserver.onError(
                Status.INVALID_ARGUMENT
                    .withDescription("Invalid UUID format: " + request.getUid())
                    .asRuntimeException()
            );
        } catch (Exception e) {
            log.error("Unexpected error in getPersonByUid: {}", e.getMessage(), e);
            responseObserver.onError(
                Status.INTERNAL
                    .withDescription("Internal error resolving person: " + e.getMessage())
                    .asRuntimeException()
            );
        }
    }

    @Override
    public void verifyPersonActive(OfficePersonRequest request, StreamObserver<OfficePersonActiveResponse> responseObserver) {
        try {
            UUID personUid = UUID.fromString(request.getUid());
            Person person = personManagerService.findByUid(personUid);
            boolean isActive = person != null && Boolean.TRUE.equals(person.getIsActive());

            OfficePersonActiveResponse response = OfficePersonActiveResponse.newBuilder()
                .setUid(request.getUid())
                .setIsActive(isActive)
                .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("Error verifying person status: {}", e.getMessage(), e);
            responseObserver.onError(
                Status.INTERNAL
                    .withDescription(e.getMessage())
                    .asRuntimeException()
            );
        }
    }
}
```

---

## 3. Client Stub Configuration (`GrpcStubConfig.java`)

All client-side gRPC channels and stub beans are defined centrally in `backend/shared/office-starter/src/main/java/project/shared_office_starter/config/GrpcStubConfig.java`.

### 3.1 Architecture of `GrpcStubConfig`
1. **Dynamic Eureka Lookup**: Resolves service IPs dynamically using `EurekaClient.getNextServerFromEureka(serviceName, false)`.
2. **Channel Creation**: Uses `ManagedChannelBuilder.forAddress(host, port).usePlaintext()`.
3. **Resilience & Retries**:
   - Load balancing: `weighted_round_robin`, `round_robin`, `pick_first`.
   - Automatic retries on `UNAVAILABLE` status with exponential backoff (initial 0.5s–2.0s, multiplier 2.0, max 5 attempts).
4. **Spring `@Bean` Exposure**: Exposes typed blocking stubs ready for `@Autowired` injection into any calling service.

### 3.2 Full Configuration Code

```java
package project.shared_office_starter.config;

import com.netflix.appinfo.InstanceInfo;
import com.netflix.discovery.EurekaClient;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import project.shared_office_common_lib.constant.ServiceRegistryIDNames;
import project.shared_office_starter.grpc.OfficeAccountRPCServiceGrpc;
import project.shared_office_starter.grpc.OfficeWorkforceRPCServiceGrpc;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Configuration
public class GrpcStubConfig {

    @Autowired
    private EurekaClient eurekaClient;

    // Account Service Port & Channel
    @Value("${grpc.client.office-account-service.port:9095}")
    private int officeAccountServicePort;

    // Workforce Service Port & Channel
    @Value("${grpc.client.office-workforce-service.port:20000}")
    private int officeWorkforceServicePort;

    // =========================================================================
    // Account Service Channel & Stubs
    // =========================================================================
    @Bean
    public ManagedChannel officeAccountServiceManagedChannel() {
        String officeAccountServiceAddress;
        try {
            InstanceInfo instanceInfo = eurekaClient.getNextServerFromEureka(
                ServiceRegistryIDNames.OFFICE_ACCOUNT_SERVICE, false
            );
            officeAccountServiceAddress = instanceInfo.getIPAddr();
        } catch (Exception e) {
            officeAccountServiceAddress = ServiceRegistryIDNames.OFFICE_ACCOUNT_SERVICE;
        }
        return ManagedChannelBuilder.forAddress(officeAccountServiceAddress, officeAccountServicePort)
            .usePlaintext()
            .enableRetry()
            .defaultServiceConfig(buildServiceConfig())
            .build();
    }

    @Bean
    public OfficeAccountRPCServiceGrpc.OfficeAccountRPCServiceBlockingStub officeAccountRPCServiceBlockingStub() {
        return OfficeAccountRPCServiceGrpc.newBlockingStub(officeAccountServiceManagedChannel());
    }

    // =========================================================================
    // Workforce Service Channel & Stubs
    // =========================================================================
    @Bean
    public ManagedChannel officeWorkforceServiceManagedChannel() {
        String officeWorkforceServiceAddress;
        try {
            InstanceInfo instanceInfo = eurekaClient.getNextServerFromEureka(
                ServiceRegistryIDNames.OFFICE_WORKFORCE_SERVICE, false
            );
            officeWorkforceServiceAddress = instanceInfo.getIPAddr();
        } catch (Exception e) {
            officeWorkforceServiceAddress = ServiceRegistryIDNames.OFFICE_WORKFORCE_SERVICE;
        }
        return ManagedChannelBuilder.forAddress(officeWorkforceServiceAddress, officeWorkforceServicePort)
            .usePlaintext()
            .enableRetry()
            .defaultServiceConfig(buildServiceConfig())
            .build();
    }

    @Bean
    public OfficeWorkforceRPCServiceGrpc.OfficeWorkforceRPCServiceBlockingStub officeWorkforceRPCServiceBlockingStub() {
        return OfficeWorkforceRPCServiceGrpc.newBlockingStub(officeWorkforceServiceManagedChannel());
    }

    // =========================================================================
    // Resilient Retry & Load Balancing Policy
    // =========================================================================
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
                        "initialBackoff", durationToServiceConfigString(Duration.ofMillis(500)),
                        "backoffMultiplier", "2.0",
                        "maxBackoff", durationToServiceConfigString(Duration.ofSeconds(2)),
                        "retryableStatusCodes", List.of("UNAVAILABLE")
                    )
                )
            )
        );
    }

    @NotNull
    private String durationToServiceConfigString(@NotNull Duration duration) {
        return (duration.toMillis() / 1000.0) + "s";
    }
}
```

---

## 4. Consuming gRPC Stubs in Client Services

Following the **Backend Layered Architecture** (`docs/content/office/BACKEND_LAYERS.md`), consuming services wrap stub calls inside a domain client adapter or directly inside a Common Service.

### 4.1 Client Adapter Pattern (`service.client.*`)

```java
package project.office_transport_service.service.client;

import io.grpc.StatusRuntimeException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import project.shared_office_starter.grpc.OfficePersonActiveResponse;
import project.shared_office_starter.grpc.OfficePersonRequest;
import project.shared_office_starter.grpc.OfficePersonResponse;
import project.shared_office_starter.grpc.OfficeWorkforceRPCServiceGrpc;

import java.util.Optional;
import java.util.UUID;

@Slf4j
@Component
public class WorkforceGrpcClient {

    private final OfficeWorkforceRPCServiceGrpc.OfficeWorkforceRPCServiceBlockingStub workforceStub;

    @Autowired
    public WorkforceGrpcClient(
        OfficeWorkforceRPCServiceGrpc.OfficeWorkforceRPCServiceBlockingStub workforceStub
    ) {
        this.workforceStub = workforceStub;
    }

    public Optional<OfficePersonResponse> getPersonByUid(UUID personUid) {
        try {
            OfficePersonRequest request = OfficePersonRequest.newBuilder()
                .setUid(personUid.toString())
                .build();
            OfficePersonResponse response = workforceStub.getPersonByUid(request);
            return Optional.of(response);
        } catch (StatusRuntimeException e) {
            log.warn("gRPC call getPersonByUid failed for UID {}: {}", personUid, e.getStatus());
            return Optional.empty();
        }
    }

    public boolean isPersonActive(UUID personUid) {
        try {
            OfficePersonRequest request = OfficePersonRequest.newBuilder()
                .setUid(personUid.toString())
                .build();
            OfficePersonActiveResponse response = workforceStub.verifyPersonActive(request);
            return response.getIsActive();
        } catch (StatusRuntimeException e) {
            log.warn("gRPC call verifyPersonActive failed for UID {}: {}", personUid, e.getStatus());
            return false;
        }
    }
}
```

### 4.2 Integration in Common Service Flow

In `project.office_transport_service.service.common.VehicleService`:

```java
@Service
public class VehicleService {

    private final VehicleManagerService vehicleManagerService;
    private final VehicleCheckerService vehicleCheckerService;
    private final WorkforceGrpcClient workforceGrpcClient;
    private final VehicleMapper vehicleMapper;

    @Autowired
    public VehicleService(
        VehicleManagerService vehicleManagerService,
        VehicleCheckerService vehicleCheckerService,
        WorkforceGrpcClient workforceGrpcClient,
        VehicleMapper vehicleMapper
    ) {
        this.vehicleManagerService = vehicleManagerService;
        this.vehicleCheckerService = vehicleCheckerService;
        this.workforceGrpcClient = workforceGrpcClient;
        this.vehicleMapper = vehicleMapper;
    }

    public VehicleResponseDTO findById(Long id) {
        Vehicle vehicle = vehicleManagerService.findById(id);
        vehicleCheckerService.checkVehicleIsActive(vehicle);

        VehicleResponseDTO response = vehicleMapper.toResponseDTO(vehicle);

        // Enrich with Owner metadata across microservice boundary via gRPC
        if (vehicle.getPersonUid() != null) {
            workforceGrpcClient.getPersonByUid(vehicle.getPersonUid())
                .ifPresent(p -> {
                    response.setOwnerName(p.getNameEnglish());
                    response.setOwnerMobile(p.getMobileTel());
                    response.setOwnerEmail(p.getEmail());
                });
        }
        return response;
    }
}
```

---

## 5. Protobuf (.proto) Standards & Placement

All proto contract files are stored in `backend/shared/office-starter/src/main/proto/`:

| File | Package | Outer Classname | Java Package |
|---|---|---|---|
| `account.proto` | `office_account` | `OfficeAccountServiceProto` | `project.shared_office_starter.grpc` |
| `workforce.proto` | `office_workforce` | `OfficeWorkforceServiceProto` | `project.shared_office_starter.grpc` |
| `transport.proto` | `office_transport` | `OfficeTransportServiceProto` | `project.shared_office_starter.grpc` |

### Protobuf Header Standard
```protobuf
syntax = "proto3";

package office_XXXXX;
option java_multiple_files = true;
option java_package = "project.shared_office_starter.grpc";
option java_outer_classname = "OfficeXXXXXServiceProto";
```

### Maven Compilation
The protobuf compiler (`protobuf-maven-plugin` + `protoc-gen-grpc-java`) compiles `.proto` files during the build phase:
```bash
cd backend/shared/office-starter
mvn clean compile
```
This generates the Java classes under `target/generated-sources/protobuf/grpc-java` and `java`.

---

## 6. Service Ports & Configuration Registry

The server port and client connection targets are defined in environment variables and `application.yml`:

| Service | Environment Var (Server) | Default Port | Stub Bean Name in `GrpcStubConfig` |
|---|---|---|---|
| `office-account-service` | `OFFICE_ACCOUNT_SERVICE_GRPC_PORT` | `9095` | `officeAccountRPCServiceBlockingStub` |
| `office-workforce-service` | `OFFICE_WORKFORCE_SERVICE_GRPC_PORT` | `20000` | `officeWorkforceRPCServiceBlockingStub` |
| `office-transport-service` | `OFFICE_TRANSPORT_SERVICE_GRPC_PORT` | `20001` | `officeTransportRPCServiceBlockingStub` |
| `office-expenditure-service` | `OFFICE_EXPENDITURE_SERVICE_GRPC_PORT` | `20002` | `officeExpenditureRPCServiceBlockingStub` |

### Server Configuration in `application.yml`
```yaml
grpc:
    server:
        port: ${OFFICE_XXXXX_SERVICE_GRPC_PORT}
```

### Client Port Mapping in `application.yml`
```yaml
grpc:
    client:
        office-account-service:
            port: ${OFFICE_ACCOUNT_SERVICE_GRPC_PORT:9095}
        office-workforce-service:
            port: ${OFFICE_WORKFORCE_SERVICE_GRPC_PORT:20000}
        office-transport-service:
            port: ${OFFICE_TRANSPORT_SERVICE_GRPC_PORT:20001}
```

---

## 7. gRPC Security & Authentication

In `backend/shared/office-starter/src/main/java/project/shared_office_starter/config/GrpcSecurityConfig.java`:
```java
@Configuration
public class GrpcSecurityConfig {

    @Bean
    public GrpcAuthenticationReader grpcAuthenticationReader() {
        return new BasicGrpcAuthenticationReader();
    }
}
```
- For internal VPC/container communication, plaintext HTTP/2 is utilized for sub-millisecond response latency.
- Inter-service calls can carry metadata headers (e.g., Bearer tokens or system client credentials) processed by `BasicGrpcAuthenticationReader`.

---

## 8. Development & Implementation Checklist

When creating a new gRPC feature between Office microservices:

1. [ ] **Define Protocol**: Add or update `.proto` in `backend/shared/office-starter/src/main/proto/`.
2. [ ] **Generate Classes**: Run `mvn compile` on `shared/office-starter`.
3. [ ] **Implement Server**: Create `project.office_XXXXX_service.service.grpc.XXXXGrpcServiceImpl` annotated with `@GrpcService`.
4. [ ] **Register Stub Bean**: Ensure `GrpcStubConfig.java` has the ManagedChannel and `*BlockingStub` bean defined.
5. [ ] **Inject Stub in Client**: Inject the stub via `@Autowired` into client adapter / common service.
6. [ ] **Error Handling**: Use `Status.NOT_FOUND`, `Status.INVALID_ARGUMENT`, `Status.UNAVAILABLE` on server; catch `StatusRuntimeException` on client.
7. [ ] **Verify in Eureka**: Verify both the calling service and server service discover each other via Netflix Eureka.
