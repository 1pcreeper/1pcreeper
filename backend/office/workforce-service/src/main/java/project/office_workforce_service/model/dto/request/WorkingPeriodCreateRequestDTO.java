package project.office_workforce_service.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkingPeriodCreateRequestDTO {

    @NotNull(message = "Organization ID is required")
    private Long orgId;

    @NotNull(message = "Start time is required")
    private LocalTime startAt;

    @NotNull(message = "End time is required")
    private LocalTime endAt;

    @NotBlank(message = "Shift name cannot be blank")
    @Size(max = 255, message = "Shift name must not exceed 255 characters")
    private String name;
}