package project.office_workforce_service.model.dto.object;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.office_workforce_service.model.entity.enums.Gender;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PersonDetailDTO {
    private Long id;
    private Long personId;
    private String bio;
    private LocalDate dateOfBirth;
    private Gender gender;
    private String nationality;
    private String occupation;
    private String address;
    private String wechatId;
    private String instagramId;
    private String website;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}