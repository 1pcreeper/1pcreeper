package project.office_workforce_service.model.dto.request;

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
public class WorkingPeriodUpdateRequestDTO {

    private LocalTime startAt;
    private LocalTime endAt;

    @Size(max = 255, message = "Shift name must not exceed 255 characters")
    private String name;

    private Boolean isActive;
}