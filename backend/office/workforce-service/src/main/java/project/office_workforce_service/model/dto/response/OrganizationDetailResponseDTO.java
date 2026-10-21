package project.office_workforce_service.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationDetailResponseDTO {
    private Long id;
    private Long orgId;
    private String bio;
    private String address;
    private String industry;
    private String website;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
