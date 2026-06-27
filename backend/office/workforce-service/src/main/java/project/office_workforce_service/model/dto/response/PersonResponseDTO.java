package project.office_workforce_service.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PersonResponseDTO {
    private Long id;
    private String nameEnglish;
    private String nameChinese;
    private String email;
    private String mobileTel;
    private String hkId;
    private Boolean isActive;
}