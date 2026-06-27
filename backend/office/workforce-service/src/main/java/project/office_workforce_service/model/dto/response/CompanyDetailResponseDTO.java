package project.office_workforce_service.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.office_workforce_service.model.dto.object.CompanyDTO;
import project.office_workforce_service.model.dto.object.CompanyDetailDTO;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyDetailResponseDTO {
    private CompanyDTO company;
    private CompanyDetailDTO detailDTO;
}