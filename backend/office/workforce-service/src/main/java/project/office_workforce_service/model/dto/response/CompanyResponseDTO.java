package project.office_workforce_service.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyResponseDTO {
    private Long id;
    private String nameEnglish;
    private String nameChinese;
    private String businessRegistrationNumber;
    private String secretaryLicenseNumber;
    private String email;
    private String tel;
    private Boolean isActive;
}