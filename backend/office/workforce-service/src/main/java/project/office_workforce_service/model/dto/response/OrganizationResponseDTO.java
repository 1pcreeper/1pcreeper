package project.office_workforce_service.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationResponseDTO {
    private Long id;
    private Long companyId;
    private String name;
    private String bio;
    private Boolean isActive;
}