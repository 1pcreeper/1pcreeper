package project.office_workforce_service.model.dto.object;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffSchedulePreferenceDTO {
    private Long id;
    private Long staffId;
    private Long placeId;
    private String placeName;
    private String placeAddress;
    private Integer weekDay;
    private Long workingPeriodId;
    private String workingPeriodName;
    private Integer priorityIndex;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}