package project.office_workforce_service.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.office_workforce_service.model.dto.object.*;
import project.office_workforce_service.model.entity.Company;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffDetailResponseDTO {
    private CompanyDTO company;
    private StaffDTO staff;
    private StaffDetailDTO staffDetail;
    private PersonDTO person;
    private PersonDetailDTO personDetail;
    private List<StaffOccupationDTO> staffOccupations;
    private List<StaffSchedulePreferenceDTO> schedulePreferences;
}