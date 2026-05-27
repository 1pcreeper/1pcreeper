package project.office_workforce_service.model.dto.request;

import jakarta.validation.constraints.Min;
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
public class PlaceScheduleRuleUpdateRequestDTO {

    @Min(value = 1, message = "A place must require at least 1 person")
    private Integer personCount;

    private List<WorkType> workTypePriorities;
}