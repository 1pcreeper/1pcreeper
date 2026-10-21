package project.office_expenditure_service.model.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OutcomeCategoryUpdateRequestDTO {
    private String name;
    private Boolean isActive;
}
