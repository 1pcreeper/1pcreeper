package project.office_workforce_service.model.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlaceWorkingPeriodRuleCreateRequestDTO {

    @NotNull(message = "Occupation rule ID is required")
    private Long occupationRuleId;

    @NotNull(message = "Working Period ID is required")
    private Long workingPeriodId;

    @NotNull(message = "Person count is required")
    @Min(value = 0, message = "Person count cannot be negative")
    private Integer personCount;
}
