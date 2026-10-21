package project.office_expenditure_service.service.checker;

import org.springframework.stereotype.Service;
import project.office_expenditure_service.model.dto.request.StaffSalaryExpenseCreateRequestDTO;
import project.office_expenditure_service.model.dto.request.StaffSalaryExpenseUpdateRequestDTO;
import project.office_expenditure_service.model.entity.StaffSalaryExpense;
import project.shared_office_starter.model.exception.PropertyValidationException;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

import java.math.BigDecimal;

@Service
public class StaffSalaryExpenseCheckerService {

    public void checkExpenseIsActive(StaffSalaryExpense expense) {
        if (expense == null || Boolean.FALSE.equals(expense.getIsActive())) {
            throw new ResourceNotFoundException("Staff salary expense not found or is deactivated.");
        }
    }

    public void checkCreateRequest(StaffSalaryExpenseCreateRequestDTO dto) {
        if (dto == null) {
            throw new PropertyValidationException("Salary expense creation payload cannot be null.");
        }
        if (dto.getName() == null || dto.getName().isBlank()) {
            throw new PropertyValidationException("Salary expense name cannot be blank.");
        }
        if (dto.getStaffSalaryId() == null) {
            throw new PropertyValidationException("Staff salary ID cannot be null.");
        }
        if (dto.getCost() == null || dto.getCost().compareTo(BigDecimal.ZERO) < 0) {
            throw new PropertyValidationException("Cost must be greater than or equal to zero.");
        }
        if (dto.getPeriod() == null) {
            throw new PropertyValidationException("Interval period cannot be null.");
        }
        if (dto.getInvokedAt() == null) {
            throw new PropertyValidationException("Invoked at timestamp cannot be null.");
        }
        if (dto.getCompanyId() == null) {
            throw new PropertyValidationException("Company ID cannot be null.");
        }
    }

    public void checkUpdateRequest(StaffSalaryExpenseUpdateRequestDTO dto) {
        if (dto == null) {
            throw new PropertyValidationException("Salary expense update payload cannot be null.");
        }
        if (dto.getCost() != null && dto.getCost().compareTo(BigDecimal.ZERO) < 0) {
            throw new PropertyValidationException("Cost must be greater than or equal to zero.");
        }
    }
}
