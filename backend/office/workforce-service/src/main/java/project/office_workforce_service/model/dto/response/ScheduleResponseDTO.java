package project.office_workforce_service.model.dto.response;

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
public class ScheduleResponseDTO {
    private Long id;
    private LocalDateTime startAt;
    private LocalDateTime endAt;

    private Long placeId;
    private String placeName; // Frontend convenience

    private Long staffId;
    private String staffNameEnglish; // Frontend convenience
    private String staffCustId; // Helpful for guard rosters

    private ScheduleStatus status;
    private String remark;
}