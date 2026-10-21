package project.office_expenditure_service.service.checker;

import org.springframework.stereotype.Service;
import project.office_expenditure_service.model.dto.request.OutcomeExpenseCreateRequestDTO;
import project.office_expenditure_service.model.dto.request.OutcomeExpenseUpdateRequestDTO;
import project.office_expenditure_service.model.entity.OutcomeExpense;
import project.shared_office_starter.model.exception.PropertyValidationException;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

import java.math.BigDecimal;

@Service
public class OutcomeExpenseCheckerService {

    public void checkExpenseIsActive(OutcomeExpense expense) {
        if (expense == null || Boolean.FALSE.equals(expense.getIsActive())) {
            throw new ResourceNotFoundException("Outcome expense not found or is deactivated.");
        }
    }

    public void checkCreateRequest(OutcomeExpenseCreateRequestDTO dto) {
        if (dto == null) {
            throw new PropertyValidationException("Expense creation payload cannot be null.");
        }
        if (dto.getName() == null || dto.getName().isBlank()) {
            throw new PropertyValidationException("Expense name cannot be blank.");
        }
        if (dto.getCost() == null || dto.getCost().compareTo(BigDecimal.ZERO) < 0) {
            throw new PropertyValidationException("Expense cost must be greater than or equal to zero.");
        }
        if (dto.getPeriod() == null) {
            throw new PropertyValidationException("Expense interval period cannot be null.");
        }
        if (dto.getInvokedAt() == null) {
            throw new PropertyValidationException("Invoked at timestamp cannot be null.");
        }
        if (dto.getCompanyId() == null) {
            throw new PropertyValidationException("Company ID cannot be null.");
        }
    }

    public void checkUpdateRequest(OutcomeExpenseUpdateRequestDTO dto) {
        if (dto == null) {
            throw new PropertyValidationException("Expense update payload cannot be null.");
        }
        if (dto.getCost() != null && dto.getCost().compareTo(BigDecimal.ZERO) < 0) {
            throw new PropertyValidationException("Expense cost must be greater than or equal to zero.");
        }
    }
}
