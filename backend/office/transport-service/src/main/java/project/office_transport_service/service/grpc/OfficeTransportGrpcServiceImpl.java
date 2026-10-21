package project.office_transport_service.service.grpc;

import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.beans.factory.annotation.Autowired;
import project.office_transport_service.model.entity.Vehicle;
import project.office_transport_service.service.manager.VehicleManagerService;
import project.shared_office_starter.grpc.OfficeTransportRPCServiceGrpc;
import project.shared_office_starter.grpc.OfficeVehicleActiveResponse;
import project.shared_office_starter.grpc.OfficeVehicleRequest;
import project.shared_office_starter.grpc.OfficeVehicleResponse;

import java.util.UUID;

@Slf4j
@GrpcService
public class OfficeTransportGrpcServiceImpl extends OfficeTransportRPCServiceGrpc.OfficeTransportRPCServiceImplBase {

    private final VehicleManagerService vehicleManagerService;

    @Autowired
    public OfficeTransportGrpcServiceImpl(VehicleManagerService vehicleManagerService) {
        this.vehicleManagerService = vehicleManagerService;
    }

    @Override
    public void getVehicleByUid(OfficeVehicleRequest request, StreamObserver<OfficeVehicleResponse> responseObserver) {
        try {
            UUID vehicleUid = UUID.fromString(request.getUid());
            Vehicle vehicle = vehicleManagerService.findByUid(vehicleUid);

            if (vehicle == null) {
                responseObserver.onError(
                    Status.NOT_FOUND
                        .withDescription("Vehicle not found with UID: " + request.getUid())
                        .asRuntimeException()
                );
                return;
            }

            OfficeVehicleResponse response = OfficeVehicleResponse.newBuilder()
                .setUid(vehicle.getUid() != null ? vehicle.getUid().toString() : request.getUid())
                .setLicensePlate(vehicle.getLicensePlate() != null ? vehicle.getLicensePlate() : "")
                .setMake(vehicle.getMake() != null ? vehicle.getMake() : "")
                .setModel(vehicle.getModel() != null ? vehicle.getModel() : "")
                .setPersonUid(vehicle.getPersonUid() != null ? vehicle.getPersonUid().toString() : "")
                .setVrdExpiryDate(vehicle.getVrdExpiryDate() != null ? vehicle.getVrdExpiryDate().toString() : "")
                .setIsActive(Boolean.TRUE.equals(vehicle.getIsActive()))
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
            log.error("Unexpected error in getVehicleByUid: {}", e.getMessage(), e);
            responseObserver.onError(
                Status.INTERNAL
                    .withDescription("Internal error resolving vehicle: " + e.getMessage())
                    .asRuntimeException()
            );
        }
    }

    @Override
    public void verifyVehicleActive(OfficeVehicleRequest request, StreamObserver<OfficeVehicleActiveResponse> responseObserver) {
        try {
            UUID vehicleUid = UUID.fromString(request.getUid());
            Vehicle vehicle = vehicleManagerService.findByUid(vehicleUid);
            boolean isActive = vehicle != null && Boolean.TRUE.equals(vehicle.getIsActive());

            OfficeVehicleActiveResponse response = OfficeVehicleActiveResponse.newBuilder()
                .setUid(request.getUid())
                .setIsActive(isActive)
                .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("Error verifying vehicle status: {}", e.getMessage(), e);
            responseObserver.onError(
                Status.INTERNAL
                    .withDescription(e.getMessage())
                    .asRuntimeException()
            );
        }
    }
}
