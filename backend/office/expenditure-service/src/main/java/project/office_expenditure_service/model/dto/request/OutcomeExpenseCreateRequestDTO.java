package project.office_expenditure_service.model.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.office_expenditure_service.model.entity.enums.IntervalPeriod;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OutcomeExpenseCreateRequestDTO {

    @NotBlank(message = "Expense name cannot be blank")
    private String name;

    private Long outcomeId;

    @NotNull(message = "Cost cannot be null")
    @DecimalMin(value = "0.00", message = "Cost must not be negative")
    private BigDecimal cost;

    @NotNull(message = "Period cannot be null")
    private IntervalPeriod period;

    @NotNull(message = "Invoked at timestamp cannot be null")
    private LocalDateTime invokedAt;

    private LocalDateTime startedAt;

    private LocalDateTime endedAt;

    @NotNull(message = "Company ID cannot be null")
    private Long companyId;
}
