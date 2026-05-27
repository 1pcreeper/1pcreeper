package project.office_workforce_service.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlaceOccupationRuleResponseDTO {
    private Long id;
    private Long placeId;
    private Long occupationId;
    private String occupationName; // Added for frontend ease
    private Integer personCount;
}