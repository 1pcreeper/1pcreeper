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
public class StaffDetailRequestDTO {

    @NotNull(message = "Max working hours is required")
    @Min(value = 1, message = "Max working hours must be greater than 0")
    private Integer maxWorkingHrs;
}