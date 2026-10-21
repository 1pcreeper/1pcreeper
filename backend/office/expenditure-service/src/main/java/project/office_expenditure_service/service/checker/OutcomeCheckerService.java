package project.office_expenditure_service.service.checker;

import org.springframework.stereotype.Service;
import project.office_expenditure_service.model.dto.request.OutcomeCreateRequestDTO;
import project.office_expenditure_service.model.dto.request.OutcomeUpdateRequestDTO;
import project.office_expenditure_service.model.entity.Outcome;
import project.shared_office_starter.model.exception.PropertyValidationException;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

import java.math.BigDecimal;

@Service
public class OutcomeCheckerService {

    public void checkOutcomeIsActive(Outcome outcome) {
        if (outcome == null || Boolean.FALSE.equals(outcome.getIsActive())) {
            throw new ResourceNotFoundException("Outcome not found or is deactivated.");
        }
    }

    public void checkCreateRequest(OutcomeCreateRequestDTO dto) {
        if (dto == null) {
            throw new PropertyValidationException("Outcome creation payload cannot be null.");
        }
        if (dto.getName() == null || dto.getName().isBlank()) {
            throw new PropertyValidationException("Outcome name cannot be blank.");
        }
        if (dto.getSubcategoryId() == null) {
            throw new PropertyValidationException("Parent subcategory ID cannot be null.");
        }
        if (dto.getDefaultPrice() == null || dto.getDefaultPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new PropertyValidationException("Default price must be greater than or equal to zero.");
        }
        if (dto.getCompanyId() == null) {
            throw new PropertyValidationException("Company ID cannot be null.");
        }
    }

    public void checkUpdateRequest(OutcomeUpdateRequestDTO dto) {
        if (dto == null) {
            throw new PropertyValidationException("Outcome update payload cannot be null.");
        }
        if (dto.getDefaultPrice() != null && dto.getDefaultPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new PropertyValidationException("Default price must be greater than or equal to zero.");
        }
    }
}
