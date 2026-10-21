package project.office_expenditure_service.model.dto.request;

import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OutcomeUpdateRequestDTO {
    private String name;
    private Long subcategoryId;
    @DecimalMin(value = "0.00", message = "Default price must not be negative")
    private BigDecimal defaultPrice;
    private Boolean isActive;
}
