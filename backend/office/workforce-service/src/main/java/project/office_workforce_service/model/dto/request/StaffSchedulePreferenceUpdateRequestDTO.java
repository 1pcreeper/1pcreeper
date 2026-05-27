package project.office_workforce_service.model.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffSchedulePreferenceUpdateRequestDTO {

    private Long placeId;

    @Min(value = 1, message = "Weekday must be between 1 (Monday) and 7 (Sunday)")
    @Max(value = 7, message = "Weekday must be between 1 (Monday) and 7 (Sunday)")
    private Integer weekDay;

    private Long workingPeriodId;

    @Min(value = 0, message = "Priority index cannot be negative")
    private Integer priorityIndex;
}