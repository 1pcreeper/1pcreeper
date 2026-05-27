package project.office_workforce_service.model.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.office_workforce_service.model.entity.enums.ScheduleStatus;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleCreateRequestDTO {

    @NotNull(message = "Start time is required")
    private LocalDateTime startAt;

    @NotNull(message = "End time is required")
    private LocalDateTime endAt;

    @NotNull(message = "Place ID is required")
    private Long placeId;

    @NotNull(message = "Staff ID is required")
    private Long staffId;

    @NotNull(message = "Status is required")
    private ScheduleStatus status;

    private String remark;
}