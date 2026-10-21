package project.office_expenditure_service.mapper;

import org.springframework.stereotype.Component;
import project.office_expenditure_service.model.dto.object.OutcomeDTO;
import project.office_expenditure_service.model.dto.request.OutcomeCreateRequestDTO;
import project.office_expenditure_service.model.dto.request.OutcomeUpdateRequestDTO;
import project.office_expenditure_service.model.dto.response.OutcomeResponseDTO;
import project.office_expenditure_service.model.entity.Outcome;
import project.office_expenditure_service.model.entity.OutcomeSubcategory;

import java.util.UUID;

@Component
public class OutcomeMapper {

    private String emptyToNull(String value) {
        if (value == null) return null;
        value = value.trim();
        return value.isEmpty() ? null : value;
    }

    public Outcome toEntity(OutcomeCreateRequestDTO request, OutcomeSubcategory subcategory) {
        if (request == null) return null;

        return Outcome.builder()
            .uid(UUID.randomUUID())
            .name(emptyToNull(request.getName()))
            .subcategory(subcategory)
            .defaultPrice(request.getDefaultPrice())
            .companyId(request.getCompanyId())
            .isActive(true)
            .build();
    }

    public void updateEntity(OutcomeUpdateRequestDTO request, Outcome entity, OutcomeSubcategory subcategory) {
        if (request == null || entity == null) return;

        if (request.getName() != null) {
            entity.setName(emptyToNull(request.getName()));
        }
        if (subcategory != null) {
            entity.setSubcategory(subcategory);
        }
        if (request.getDefaultPrice() != null) {
            entity.setDefaultPrice(request.getDefaultPrice());
        }
        if (request.getIsActive() != null) {
            entity.setIsActive(request.getIsActive());
        }
    }

    public OutcomeResponseDTO toResponseDTO(Outcome entity) {
        if (entity == null) return null;

        return OutcomeResponseDTO.builder()
            .id(entity.getId())
            .uid(entity.getUid())
            .name(entity.getName())
            .subcategoryId(entity.getSubcategory() != null ? entity.getSubcategory().getId() : null)
            .subcategoryName(entity.getSubcategory() != null ? entity.getSubcategory().getName() : null)
            .defaultPrice(entity.getDefaultPrice())
            .companyId(entity.getCompanyId())
            .isActive(entity.getIsActive())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }

    public OutcomeDTO toDTO(Outcome entity) {
        if (entity == null) return null;

        return OutcomeDTO.builder()
            .id(entity.getId())
            .uid(entity.getUid())
            .name(entity.getName())
            .subcategoryId(entity.getSubcategory() != null ? entity.getSubcategory().getId() : null)
            .subcategoryName(entity.getSubcategory() != null ? entity.getSubcategory().getName() : null)
            .defaultPrice(entity.getDefaultPrice())
            .companyId(entity.getCompanyId())
            .isActive(entity.getIsActive())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }
}
