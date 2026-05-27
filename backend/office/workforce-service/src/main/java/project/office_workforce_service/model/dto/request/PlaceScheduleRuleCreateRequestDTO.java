package project.office_workforce_service.model.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
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
public class PlaceScheduleRuleCreateRequestDTO {

    @NotNull(message = "Place ID is required")
    private Long placeId;

    @NotNull(message = "Total person count is required")
    @Min(value = 1, message = "A place must require at least 1 person")
    private Integer personCount;

    // Optional list to rank preferences like [FULL_TIME, PART_TIME]
    private List<WorkType> workTypePriorities;
}