package project.office_workforce_service.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.office_workforce_service.model.entity.enums.WorkType;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlaceScheduleRuleResponseDTO {
    private Long id;
    private Long placeId;
    private Integer personCount;
    private List<WorkType> workTypePriorities;
}