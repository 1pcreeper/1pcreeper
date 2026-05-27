package project.office_workforce_service.model.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlaceOccupationRuleCreateRequestDTO {

    @NotNull(message = "Place ID is required")
    private Long placeId;

    @NotNull(message = "Occupation ID is required")
    private Long occupationId;

    @NotNull(message = "Person count is required")
    @Min(value = 0, message = "Person count cannot be negative")
    private Integer personCount;
}