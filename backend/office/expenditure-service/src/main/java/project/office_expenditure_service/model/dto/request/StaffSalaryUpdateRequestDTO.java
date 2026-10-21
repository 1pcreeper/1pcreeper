package project.office_expenditure_service.model.dto.request;

import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffSalaryUpdateRequestDTO {
    private Long staffId;
    @DecimalMin(value = "0.00", message = "Salary amount must not be negative")
    private BigDecimal amount;
    private LocalDateTime approvedAt;
    private Boolean isActive;
}
