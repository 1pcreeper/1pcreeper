package project.office_expenditure_service.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OutcomeSubcategoryCreateRequestDTO {

    @NotBlank(message = "Subcategory name cannot be blank")
    private String name;

    @NotNull(message = "Category ID cannot be null")
    private Long categoryId;

    @NotNull(message = "Company ID cannot be null")
    private Long companyId;
}
