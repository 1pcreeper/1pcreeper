package project.office_expenditure_service.mapper;

import org.springframework.stereotype.Component;
import project.office_expenditure_service.model.dto.object.StaffSalaryExpenseDTO;
import project.office_expenditure_service.model.dto.request.StaffSalaryExpenseCreateRequestDTO;
import project.office_expenditure_service.model.dto.request.StaffSalaryExpenseUpdateRequestDTO;
import project.office_expenditure_service.model.dto.response.StaffSalaryExpenseResponseDTO;
import project.office_expenditure_service.model.entity.StaffSalary;
import project.office_expenditure_service.model.entity.StaffSalaryExpense;

import java.util.UUID;

@Component
public class StaffSalaryExpenseMapper {

    private String emptyToNull(String value) {
        if (value == null) return null;
        value = value.trim();
        return value.isEmpty() ? null : value;
    }

    public StaffSalaryExpense toEntity(StaffSalaryExpenseCreateRequestDTO request, StaffSalary staffSalary) {
        if (request == null) return null;

        return StaffSalaryExpense.builder()
            .uid(UUID.randomUUID())
            .name(emptyToNull(request.getName()))
            .staffSalary(staffSalary)
            .cost(request.getCost())
            .period(request.getPeriod())
            .invokedAt(request.getInvokedAt())
            .startedAt(request.getStartedAt())
            .endedAt(request.getEndedAt())
            .companyId(request.getCompanyId())
            .isActive(true)
            .build();
    }

    public void updateEntity(StaffSalaryExpenseUpdateRequestDTO request, StaffSalaryExpense entity, StaffSalary staffSalary) {
        if (request == null || entity == null) return;

        if (request.getName() != null) {
            entity.setName(emptyToNull(request.getName()));
        }
        if (staffSalary != null) {
            entity.setStaffSalary(staffSalary);
        }
        if (request.getCost() != null) {
            entity.setCost(request.getCost());
        }
        if (request.getPeriod() != null) {
            entity.setPeriod(request.getPeriod());
        }
        if (request.getInvokedAt() != null) {
            entity.setInvokedAt(request.getInvokedAt());
        }
        if (request.getStartedAt() != null) {
            entity.setStartedAt(request.getStartedAt());
        }
        if (request.getEndedAt() != null) {
            entity.setEndedAt(request.getEndedAt());
        }
        if (request.getIsActive() != null) {
            entity.setIsActive(request.getIsActive());
        }
    }

    public StaffSalaryExpenseResponseDTO toResponseDTO(StaffSalaryExpense entity) {
        if (entity == null) return null;

        return StaffSalaryExpenseResponseDTO.builder()
            .id(entity.getId())
            .uid(entity.getUid())
            .name(entity.getName())
            .staffSalaryId(entity.getStaffSalary() != null ? entity.getStaffSalary().getId() : null)
            .cost(entity.getCost())
            .period(entity.getPeriod())
            .invokedAt(entity.getInvokedAt())
            .startedAt(entity.getStartedAt())
            .endedAt(entity.getEndedAt())
            .companyId(entity.getCompanyId())
            .isActive(entity.getIsActive())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }

    public StaffSalaryExpenseDTO toDTO(StaffSalaryExpense entity) {
        if (entity == null) return null;

        return StaffSalaryExpenseDTO.builder()
            .id(entity.getId())
            .uid(entity.getUid())
            .name(entity.getName())
            .staffSalaryId(entity.getStaffSalary() != null ? entity.getStaffSalary().getId() : null)
            .cost(entity.getCost())
            .period(entity.getPeriod())
            .invokedAt(entity.getInvokedAt())
            .startedAt(entity.getStartedAt())
            .endedAt(entity.getEndedAt())
            .companyId(entity.getCompanyId())
            .isActive(entity.getIsActive())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }
}
