package project.office_workforce_service.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.office_workforce_service.model.entity.enums.Gender;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PersonDetailResponseDTO {
    private String bio;
    private LocalDate dateOfBirth;
    private Gender gender;
    private String nationality;
    private String occupation;
    private String address;
    private String wechatId;
    private String instagramId;
    private String website;
}