package project.office_workforce_service.model.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.office_workforce_service.model.entity.enums.ScheduleStatus;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleStatusUpdateRequestDTO {

    @NotNull(message = "Status is required")
    private ScheduleStatus status;
}