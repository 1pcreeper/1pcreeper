package project.office_expenditure_service.service.checker;

import org.springframework.stereotype.Service;
import project.office_expenditure_service.model.dto.request.OutcomeSubcategoryCreateRequestDTO;
import project.office_expenditure_service.model.dto.request.OutcomeSubcategoryUpdateRequestDTO;
import project.office_expenditure_service.model.entity.OutcomeSubcategory;
import project.shared_office_starter.model.exception.PropertyValidationException;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

@Service
public class OutcomeSubcategoryCheckerService {

    public void checkSubcategoryIsActive(OutcomeSubcategory subcategory) {
        if (subcategory == null || Boolean.FALSE.equals(subcategory.getIsActive())) {
            throw new ResourceNotFoundException("Outcome subcategory not found or is deactivated.");
        }
    }

    public void checkCreateRequest(OutcomeSubcategoryCreateRequestDTO dto) {
        if (dto == null) {
            throw new PropertyValidationException("Subcategory creation payload cannot be null.");
        }
        if (dto.getName() == null || dto.getName().isBlank()) {
            throw new PropertyValidationException("Subcategory name cannot be blank.");
        }
        if (dto.getCategoryId() == null) {
            throw new PropertyValidationException("Parent category ID cannot be null.");
        }
        if (dto.getCompanyId() == null) {
            throw new PropertyValidationException("Company ID cannot be null.");
        }
    }

    public void checkUpdateRequest(OutcomeSubcategoryUpdateRequestDTO dto) {
        if (dto == null) {
            throw new PropertyValidationException("Subcategory update payload cannot be null.");
        }
        if (dto.getName() != null && dto.getName().isBlank()) {
            throw new PropertyValidationException("Subcategory name cannot be blank.");
        }
    }
}
