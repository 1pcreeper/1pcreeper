package project.office_expenditure_service.mapper;

import org.springframework.stereotype.Component;
import project.office_expenditure_service.model.dto.object.OutcomeCategoryDTO;
import project.office_expenditure_service.model.dto.request.OutcomeCategoryCreateRequestDTO;
import project.office_expenditure_service.model.dto.request.OutcomeCategoryUpdateRequestDTO;
import project.office_expenditure_service.model.dto.response.OutcomeCategoryResponseDTO;
import project.office_expenditure_service.model.entity.OutcomeCategory;

import java.util.UUID;

@Component
public class OutcomeCategoryMapper {

    private String emptyToNull(String value) {
        if (value == null) return null;
        value = value.trim();
        return value.isEmpty() ? null : value;
    }

    public OutcomeCategory toEntity(OutcomeCategoryCreateRequestDTO request) {
        if (request == null) return null;

        return OutcomeCategory.builder()
            .uid(UUID.randomUUID())
            .name(emptyToNull(request.getName()))
            .companyId(request.getCompanyId())
            .isActive(true)
            .build();
    }

    public void updateEntity(OutcomeCategoryUpdateRequestDTO request, OutcomeCategory entity) {
        if (request == null || entity == null) return;

        if (request.getName() != null) {
            entity.setName(emptyToNull(request.getName()));
        }
        if (request.getIsActive() != null) {
            entity.setIsActive(request.getIsActive());
        }
    }

    public OutcomeCategoryResponseDTO toResponseDTO(OutcomeCategory entity) {
        if (entity == null) return null;

        return OutcomeCategoryResponseDTO.builder()
            .id(entity.getId())
            .uid(entity.getUid())
            .name(entity.getName())
            .companyId(entity.getCompanyId())
            .isActive(entity.getIsActive())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }

    public OutcomeCategoryDTO toDTO(OutcomeCategory entity) {
        if (entity == null) return null;

        return OutcomeCategoryDTO.builder()
            .id(entity.getId())
            .uid(entity.getUid())
            .name(entity.getName())
            .companyId(entity.getCompanyId())
            .isActive(entity.getIsActive())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }
}
