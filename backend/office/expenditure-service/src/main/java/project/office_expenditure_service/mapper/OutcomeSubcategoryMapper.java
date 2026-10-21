package project.office_expenditure_service.mapper;

import org.springframework.stereotype.Component;
import project.office_expenditure_service.model.dto.object.OutcomeSubcategoryDTO;
import project.office_expenditure_service.model.dto.request.OutcomeSubcategoryCreateRequestDTO;
import project.office_expenditure_service.model.dto.request.OutcomeSubcategoryUpdateRequestDTO;
import project.office_expenditure_service.model.dto.response.OutcomeSubcategoryResponseDTO;
import project.office_expenditure_service.model.entity.OutcomeCategory;
import project.office_expenditure_service.model.entity.OutcomeSubcategory;

import java.util.UUID;

@Component
public class OutcomeSubcategoryMapper {

    private String emptyToNull(String value) {
        if (value == null) return null;
        value = value.trim();
        return value.isEmpty() ? null : value;
    }

    public OutcomeSubcategory toEntity(OutcomeSubcategoryCreateRequestDTO request, OutcomeCategory category) {
        if (request == null) return null;

        return OutcomeSubcategory.builder()
            .uid(UUID.randomUUID())
            .name(emptyToNull(request.getName()))
            .category(category)
            .companyId(request.getCompanyId())
            .isActive(true)
            .build();
    }

    public void updateEntity(OutcomeSubcategoryUpdateRequestDTO request, OutcomeSubcategory entity, OutcomeCategory category) {
        if (request == null || entity == null) return;

        if (request.getName() != null) {
            entity.setName(emptyToNull(request.getName()));
        }
        if (category != null) {
            entity.setCategory(category);
        }
        if (request.getIsActive() != null) {
            entity.setIsActive(request.getIsActive());
        }
    }

    public OutcomeSubcategoryResponseDTO toResponseDTO(OutcomeSubcategory entity) {
        if (entity == null) return null;

        return OutcomeSubcategoryResponseDTO.builder()
            .id(entity.getId())
            .uid(entity.getUid())
            .name(entity.getName())
            .categoryId(entity.getCategory() != null ? entity.getCategory().getId() : null)
            .categoryName(entity.getCategory() != null ? entity.getCategory().getName() : null)
            .companyId(entity.getCompanyId())
            .isActive(entity.getIsActive())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }

    public OutcomeSubcategoryDTO toDTO(OutcomeSubcategory entity) {
        if (entity == null) return null;

        return OutcomeSubcategoryDTO.builder()
            .id(entity.getId())
            .uid(entity.getUid())
            .name(entity.getName())
            .categoryId(entity.getCategory() != null ? entity.getCategory().getId() : null)
            .categoryName(entity.getCategory() != null ? entity.getCategory().getName() : null)
            .companyId(entity.getCompanyId())
            .isActive(entity.getIsActive())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }
}
