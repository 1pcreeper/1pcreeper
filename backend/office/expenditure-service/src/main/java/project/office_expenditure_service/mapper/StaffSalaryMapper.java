package project.office_expenditure_service.mapper;

import org.springframework.stereotype.Component;
import project.office_expenditure_service.model.dto.object.StaffSalaryDTO;
import project.office_expenditure_service.model.dto.request.StaffSalaryCreateRequestDTO;
import project.office_expenditure_service.model.dto.request.StaffSalaryUpdateRequestDTO;
import project.office_expenditure_service.model.dto.response.StaffSalaryResponseDTO;
import project.office_expenditure_service.model.entity.StaffSalary;

import java.util.UUID;

@Component
public class StaffSalaryMapper {

    public StaffSalary toEntity(StaffSalaryCreateRequestDTO request) {
        if (request == null) return null;

        return StaffSalary.builder()
            .uid(UUID.randomUUID())
            .staffId(request.getStaffId())
            .amount(request.getAmount())
            .approvedAt(request.getApprovedAt())
            .isActive(true)
            .build();
    }

    public void updateEntity(StaffSalaryUpdateRequestDTO request, StaffSalary entity) {
        if (request == null || entity == null) return;

        if (request.getStaffId() != null) {
            entity.setStaffId(request.getStaffId());
        }
        if (request.getAmount() != null) {
            entity.setAmount(request.getAmount());
        }
        if (request.getApprovedAt() != null) {
            entity.setApprovedAt(request.getApprovedAt());
        }
        if (request.getIsActive() != null) {
            entity.setIsActive(request.getIsActive());
        }
    }

    public StaffSalaryResponseDTO toResponseDTO(StaffSalary entity) {
        if (entity == null) return null;

        return StaffSalaryResponseDTO.builder()
            .id(entity.getId())
            .uid(entity.getUid())
            .staffId(entity.getStaffId())
            .amount(entity.getAmount())
            .approvedAt(entity.getApprovedAt())
            .isActive(entity.getIsActive())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }

    public StaffSalaryDTO toDTO(StaffSalary entity) {
        if (entity == null) return null;

        return StaffSalaryDTO.builder()
            .id(entity.getId())
            .uid(entity.getUid())
            .staffId(entity.getStaffId())
            .amount(entity.getAmount())
            .approvedAt(entity.getApprovedAt())
            .isActive(entity.getIsActive())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }
}
