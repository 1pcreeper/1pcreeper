package project.office_workforce_service.model.dto.object;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.office_workforce_service.model.entity.enums.WorkType;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlaceScheduleRuleDTO {
    private Long id;
    private Long placeId;
    private Integer personCount;
    private List<WorkType> workTypePriorities;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}