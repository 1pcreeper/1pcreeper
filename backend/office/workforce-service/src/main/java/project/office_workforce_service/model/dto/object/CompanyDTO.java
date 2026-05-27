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
public class CompanyDTO {
    private Long id;
    private String nameEnglish;
    private String nameChinese;
    private String businessRegistrationNumber;
    private String secretaryLicenseNumber;
    private String email;
    private String tel;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}