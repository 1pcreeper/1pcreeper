package project.office_expenditure_service.service.checker;

import org.springframework.stereotype.Service;
import project.office_expenditure_service.model.dto.request.StaffSalaryCreateRequestDTO;
import project.office_expenditure_service.model.dto.request.StaffSalaryUpdateRequestDTO;
import project.office_expenditure_service.model.entity.StaffSalary;
import project.shared_office_starter.model.exception.PropertyValidationException;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

import java.math.BigDecimal;

@Service
public class StaffSalaryCheckerService {

    public void checkSalaryIsActive(StaffSalary salary) {
        if (salary == null || Boolean.FALSE.equals(salary.getIsActive())) {
            throw new ResourceNotFoundException("Staff salary record not found or is deactivated.");
        }
    }

    public void checkCreateRequest(StaffSalaryCreateRequestDTO dto) {
        if (dto == null) {
            throw new PropertyValidationException("Staff salary creation payload cannot be null.");
        }
        if (dto.getStaffId() == null) {
            throw new PropertyValidationException("Staff ID cannot be null.");
        }
        if (dto.getAmount() == null || dto.getAmount().compareTo(BigDecimal.ZERO) < 0) {
            throw new PropertyValidationException("Salary amount must be greater than or equal to zero.");
        }
        if (dto.getApprovedAt() == null) {
            throw new PropertyValidationException("Salary approval timestamp cannot be null.");
        }
    }

    public void checkUpdateRequest(StaffSalaryUpdateRequestDTO dto) {
        if (dto == null) {
            throw new PropertyValidationException("Staff salary update payload cannot be null.");
        }
        if (dto.getAmount() != null && dto.getAmount().compareTo(BigDecimal.ZERO) < 0) {
            throw new PropertyValidationException("Salary amount must be greater than or equal to zero.");
        }
    }
}
