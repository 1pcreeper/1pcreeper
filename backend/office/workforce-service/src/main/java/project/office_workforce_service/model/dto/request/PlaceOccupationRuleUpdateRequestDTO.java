package project.office_workforce_service.model.dto.request;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlaceOccupationRuleUpdateRequestDTO {

    @Min(value = 0, message = "Person count cannot be negative")
    private Integer personCount;
}