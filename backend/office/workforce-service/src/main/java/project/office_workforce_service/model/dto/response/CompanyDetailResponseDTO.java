package project.office_workforce_service.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyDetailResponseDTO {
    private String bio;
    private String address;
    private String industry;
    private String website;
}