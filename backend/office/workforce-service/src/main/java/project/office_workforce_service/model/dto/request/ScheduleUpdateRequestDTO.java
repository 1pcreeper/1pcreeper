package project.office_workforce_service.model.dto.request;

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
public class ScheduleUpdateRequestDTO {

    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private Long placeId;
    private Long staffId;
    private ScheduleStatus status;
    private String remark;
}