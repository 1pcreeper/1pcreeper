package project.office_expenditure_service.model.dto.request;

import jakarta.validation.constraints.DecimalMin;
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
public class OutcomeExpenseUpdateRequestDTO {
    private String name;
    private Long outcomeId;
    @DecimalMin(value = "0.00", message = "Cost must not be negative")
    private BigDecimal cost;
    private IntervalPeriod period;
    private LocalDateTime invokedAt;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private Boolean isActive;
}
