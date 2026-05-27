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
public class PlaceOccupationRuleDTO {
    private Long id;
    private Long placeId;
    private Long occupationId;
    private Integer personCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}