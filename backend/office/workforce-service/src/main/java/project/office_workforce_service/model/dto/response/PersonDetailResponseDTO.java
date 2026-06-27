package project.office_workforce_service.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.office_workforce_service.model.dto.object.PersonDTO;
import project.office_workforce_service.model.dto.object.PersonDetailDTO;
import project.office_workforce_service.model.entity.enums.Gender;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PersonDetailResponseDTO {
    private PersonDTO person;
    private PersonDetailDTO detail;
}