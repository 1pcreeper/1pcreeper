package project.office_workforce_service.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OccupationResponseDTO {
    private Long id;
    private String name;
    private Long orgId;
    private Boolean isActive;
}