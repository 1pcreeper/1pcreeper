package project.office_account_service.service.grpc;

import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.beans.factory.annotation.Autowired;
import project.office_account_service.model.entity.OfficeUser;
import project.office_account_service.service.manager.OfficeUserManagerService;
import project.shared_office_starter.grpc.OfficeAccountRPCServiceGrpc;
import project.shared_office_starter.grpc.OfficeUserRequest;
import project.shared_office_starter.grpc.OfficeUserResponse;

@Slf4j
@GrpcService
public class OfficeAccountGrpcServiceImpl extends OfficeAccountRPCServiceGrpc.OfficeAccountRPCServiceImplBase {

    private final OfficeUserManagerService officeUserManagerService;

    @Autowired
    public OfficeAccountGrpcServiceImpl(OfficeUserManagerService officeUserManagerService) {
        this.officeUserManagerService = officeUserManagerService;
    }

    @Override
    public void findById(OfficeUserRequest request, StreamObserver<OfficeUserResponse> responseObserver) {
        try {
            Long id = Long.parseLong(request.getId());
            OfficeUser user = officeUserManagerService.findById(id);

            if (user == null) {
                responseObserver.onError(
                    Status.NOT_FOUND
                        .withDescription("User not found by ID: " + request.getId())
                        .asRuntimeException()
                );
                return;
            }

            OfficeUserResponse response = OfficeUserResponse.newBuilder()
                .setId(user.getId().toString())
                .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (NumberFormatException e) {
            log.error("Invalid ID format: {}", request.getId(), e);
            responseObserver.onError(
                Status.INVALID_ARGUMENT
                    .withDescription("Invalid numeric ID: " + request.getId())
                    .asRuntimeException()
            );
        } catch (Exception e) {
            log.error("Error finding user by ID {}: {}", request.getId(), e.getMessage(), e);
            responseObserver.onError(
                Status.INTERNAL
                    .withDescription("Internal error resolving user: " + e.getMessage())
                    .asRuntimeException()
            );
        }
    }
}
