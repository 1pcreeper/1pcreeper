package project.office_expenditure_service.service.grpc;

import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.beans.factory.annotation.Autowired;
import project.office_expenditure_service.model.entity.StaffSalary;
import project.office_expenditure_service.service.manager.StaffSalaryManagerService;
import project.shared_office_starter.grpc.OfficeExpenditureRPCServiceGrpc;
import project.shared_office_starter.grpc.OfficeStaffSalaryRequest;
import project.shared_office_starter.grpc.OfficeStaffSalaryResponse;

import java.util.Optional;

@Slf4j
@GrpcService
public class OfficeExpenditureGrpcServiceImpl extends OfficeExpenditureRPCServiceGrpc.OfficeExpenditureRPCServiceImplBase {

    private final StaffSalaryManagerService staffSalaryManagerService;

    @Autowired
    public OfficeExpenditureGrpcServiceImpl(StaffSalaryManagerService staffSalaryManagerService) {
        this.staffSalaryManagerService = staffSalaryManagerService;
    }

    @Override
    public void getSalaryByStaffId(OfficeStaffSalaryRequest request, StreamObserver<OfficeStaffSalaryResponse> responseObserver) {
        try {
            long staffId = request.getStaffId();
            Optional<StaffSalary> salaryOpt = staffSalaryManagerService.findLatestApprovedSalary(staffId);

            if (salaryOpt.isEmpty()) {
                responseObserver.onError(
                    Status.NOT_FOUND
                        .withDescription("Active salary not found for staff ID: " + staffId)
                        .asRuntimeException()
                );
                return;
            }

            StaffSalary salary = salaryOpt.get();
            OfficeStaffSalaryResponse response = OfficeStaffSalaryResponse.newBuilder()
                .setStaffId(salary.getStaffId() != null ? salary.getStaffId() : staffId)
                .setAmount(salary.getAmount() != null ? salary.getAmount().toPlainString() : "0.00")
                .setApprovedAt(salary.getApprovedAt() != null ? salary.getApprovedAt().toString() : "")
                .setIsActive(Boolean.TRUE.equals(salary.getIsActive()))
                .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("Error retrieving salary for staff ID {}: {}", request.getStaffId(), e.getMessage(), e);
            responseObserver.onError(
                Status.INTERNAL
                    .withDescription("Internal error retrieving salary: " + e.getMessage())
                    .asRuntimeException()
            );
        }
    }
}
