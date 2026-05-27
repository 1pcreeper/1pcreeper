package project.office_workforce_service.model.dto.request;

import jakarta.validation.constraints.Max;
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
public class StaffSchedulePreferenceCreateRequestDTO {

    @NotNull(message = "Staff ID is required")
    private Long staffId;

    @NotNull(message = "Place ID is required")
    private Long placeId;

    @NotNull(message = "Weekday is required")
    @Min(value = 1, message = "Weekday must be between 1 (Monday) and 7 (Sunday)")
    @Max(value = 7, message = "Weekday must be between 1 (Monday) and 7 (Sunday)")
    private Integer weekDay;

    @NotNull(message = "Working Period ID is required")
    private Long workingPeriodId;

    @Min(value = 0, message = "Priority index cannot be negative")
    private Integer priorityIndex = 0; // Defaulting to 0 if not provided
}