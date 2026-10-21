package project.office_expenditure_service.service.checker;

import org.springframework.stereotype.Service;
import project.office_expenditure_service.model.dto.request.OutcomeCategoryCreateRequestDTO;
import project.office_expenditure_service.model.dto.request.OutcomeCategoryUpdateRequestDTO;
import project.office_expenditure_service.model.entity.OutcomeCategory;
import project.shared_office_starter.model.exception.PropertyValidationException;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

@Service
public class OutcomeCategoryCheckerService {

    public void checkCategoryIsActive(OutcomeCategory category) {
        if (category == null || Boolean.FALSE.equals(category.getIsActive())) {
            throw new ResourceNotFoundException("Outcome category not found or is deactivated.");
        }
    }

    public void checkCreateRequest(OutcomeCategoryCreateRequestDTO dto) {
        if (dto == null) {
            throw new PropertyValidationException("Category creation payload cannot be null.");
        }
        if (dto.getName() == null || dto.getName().isBlank()) {
            throw new PropertyValidationException("Category name cannot be blank.");
        }
        if (dto.getCompanyId() == null) {
            throw new PropertyValidationException("Company ID cannot be null.");
        }
    }

    public void checkUpdateRequest(OutcomeCategoryUpdateRequestDTO dto) {
        if (dto == null) {
            throw new PropertyValidationException("Category update payload cannot be null.");
        }
        if (dto.getName() != null && dto.getName().isBlank()) {
            throw new PropertyValidationException("Category name cannot be blank.");
        }
    }
}
