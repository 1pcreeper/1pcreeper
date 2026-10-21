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
                .setUid(person.getUid() != null ? person.getUid().toString() : request.getUid())
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

    public void searchPersons(project.shared_office_starter.grpc.OfficePersonSearchRequest request, StreamObserver<project.shared_office_starter.grpc.OfficePersonListResponse> responseObserver) {
        try {
            int limit = request.getLimit() > 0 ? request.getLimit() : 20;
            org.springframework.data.domain.Page<Person> page = personManagerService.search(
                request.getQuery(), true, org.springframework.data.domain.PageRequest.of(0, limit)
            );

            project.shared_office_starter.grpc.OfficePersonListResponse.Builder builder =
                project.shared_office_starter.grpc.OfficePersonListResponse.newBuilder();

            for (Person person : page.getContent()) {
                builder.addPersons(
                    OfficePersonResponse.newBuilder()
                        .setUid(person.getUid() != null ? person.getUid().toString() : "")
                        .setNameEnglish(person.getNameEnglish() != null ? person.getNameEnglish() : "")
                        .setNameChinese(person.getNameChinese() != null ? person.getNameChinese() : "")
                        .setMobileTel(person.getMobileTel() != null ? person.getMobileTel() : "")
                        .setOfficeTel(person.getOfficeTel() != null ? person.getOfficeTel() : "")
                        .setEmail(person.getEmail() != null ? person.getEmail() : "")
                        .setHkId(person.getHkId() != null ? person.getHkId() : "")
                        .setIsActive(Boolean.TRUE.equals(person.getIsActive()))
                        .build()
                );
            }

            responseObserver.onNext(builder.build());
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("Error searching persons in gRPC: {}", e.getMessage(), e);
            responseObserver.onError(
                Status.INTERNAL
                    .withDescription("Internal error searching persons: " + e.getMessage())
                    .asRuntimeException()
            );
        }
    }
}

