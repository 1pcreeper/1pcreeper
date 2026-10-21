package project.office_expenditure_service.model.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OutcomeCreateRequestDTO {

    @NotBlank(message = "Outcome name cannot be blank")
    private String name;

    @NotNull(message = "Subcategory ID cannot be null")
    private Long subcategoryId;

    @NotNull(message = "Default price cannot be null")
    @DecimalMin(value = "0.00", message = "Default price must not be negative")
    private BigDecimal defaultPrice;

    @NotNull(message = "Company ID cannot be null")
    private Long companyId;
}
