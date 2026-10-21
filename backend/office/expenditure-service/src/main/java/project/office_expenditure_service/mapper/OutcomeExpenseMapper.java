package project.office_expenditure_service.mapper;

import org.springframework.stereotype.Component;
import project.office_expenditure_service.model.dto.object.OutcomeExpenseDTO;
import project.office_expenditure_service.model.dto.request.OutcomeExpenseCreateRequestDTO;
import project.office_expenditure_service.model.dto.request.OutcomeExpenseUpdateRequestDTO;
import project.office_expenditure_service.model.dto.response.OutcomeExpenseResponseDTO;
import project.office_expenditure_service.model.entity.Outcome;
import project.office_expenditure_service.model.entity.OutcomeExpense;

import java.util.UUID;

@Component
public class OutcomeExpenseMapper {

    private String emptyToNull(String value) {
        if (value == null) return null;
        value = value.trim();
        return value.isEmpty() ? null : value;
    }

    public OutcomeExpense toEntity(OutcomeExpenseCreateRequestDTO request, Outcome outcome) {
        if (request == null) return null;

        return OutcomeExpense.builder()
            .uid(UUID.randomUUID())
            .name(emptyToNull(request.getName()))
            .outcome(outcome)
            .cost(request.getCost())
            .period(request.getPeriod())
            .invokedAt(request.getInvokedAt())
            .startedAt(request.getStartedAt())
            .endedAt(request.getEndedAt())
            .companyId(request.getCompanyId())
            .isActive(true)
            .build();
    }

    public void updateEntity(OutcomeExpenseUpdateRequestDTO request, OutcomeExpense entity, Outcome outcome) {
        if (request == null || entity == null) return;

        if (request.getName() != null) {
            entity.setName(emptyToNull(request.getName()));
        }
        if (outcome != null) {
            entity.setOutcome(outcome);
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

    public OutcomeExpenseResponseDTO toResponseDTO(OutcomeExpense entity) {
        if (entity == null) return null;

        return OutcomeExpenseResponseDTO.builder()
            .id(entity.getId())
            .uid(entity.getUid())
            .name(entity.getName())
            .outcomeId(entity.getOutcome() != null ? entity.getOutcome().getId() : null)
            .outcomeName(entity.getOutcome() != null ? entity.getOutcome().getName() : null)
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

    public OutcomeExpenseDTO toDTO(OutcomeExpense entity) {
        if (entity == null) return null;

        return OutcomeExpenseDTO.builder()
            .id(entity.getId())
            .uid(entity.getUid())
            .name(entity.getName())
            .outcomeId(entity.getOutcome() != null ? entity.getOutcome().getId() : null)
            .outcomeName(entity.getOutcome() != null ? entity.getOutcome().getName() : null)
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
