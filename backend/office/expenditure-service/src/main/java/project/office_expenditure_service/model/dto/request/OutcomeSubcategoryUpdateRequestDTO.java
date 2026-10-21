package project.office_expenditure_service.model.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OutcomeSubcategoryUpdateRequestDTO {
    private String name;
    private Long categoryId;
    private Boolean isActive;
}
