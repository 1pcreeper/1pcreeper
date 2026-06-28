package project.office_workforce_service.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.office_workforce_service.model.dto.object.PersonDTO;
import project.office_workforce_service.model.dto.object.PersonDetailDTO;
import project.office_workforce_service.model.dto.object.StaffDTO;
import project.office_workforce_service.model.entity.enums.Gender;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PersonDetailResponseDTO {
    private PersonDTO person;
    private PersonDetailDTO detail;
    private List<StaffDTO> staffs;
}