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
public class CompanyDetailDTO {
    private Long id;
    private Long companyId;
    private String bio;
    private String address;
    private String industry;
    private String website;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}