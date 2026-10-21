package project.office_expenditure_service.model.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
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
public class StaffSalaryCreateRequestDTO {

    @NotNull(message = "Staff ID cannot be null")
    private Long staffId;

    @NotNull(message = "Salary amount cannot be null")
    @DecimalMin(value = "0.00", message = "Salary amount must not be negative")
    private BigDecimal amount;

    @NotNull(message = "Approved at timestamp cannot be null")
    private LocalDateTime approvedAt;
}
