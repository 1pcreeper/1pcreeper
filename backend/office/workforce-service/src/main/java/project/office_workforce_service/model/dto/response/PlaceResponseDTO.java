package project.office_workforce_service.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlaceResponseDTO {
    private Long id;
    private Long orgId;
    private String name;
    private String address;
    private Boolean isActive;
}