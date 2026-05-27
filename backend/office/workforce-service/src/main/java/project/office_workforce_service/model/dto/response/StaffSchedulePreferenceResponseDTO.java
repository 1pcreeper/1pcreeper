package project.office_workforce_service.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffSchedulePreferenceResponseDTO {
    private Long id;
    private Long staffId;
    private String staffName; // For frontend display
    private Long placeId;
    private String placeName; // For frontend display
    private Integer weekDay;
    private Long workingPeriodId;
    private String workingPeriodName; // For frontend display
    private Integer priorityIndex;
}