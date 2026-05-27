package project.office_workforce_service.model.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyDetailRequestDTO {
    private String bio;
    private String address;
    private String industry;
    private String website;
}