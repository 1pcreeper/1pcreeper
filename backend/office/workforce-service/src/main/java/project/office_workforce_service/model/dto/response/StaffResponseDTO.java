package project.office_workforce_service.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.office_workforce_service.model.entity.enums.WorkType;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffResponseDTO {
    private Long id;
    
    private Long personId;
    private String personNameEnglish;
    private String personNameChinese;
    private Long orgId;
    private String orgName;

    private String custId;
    private WorkType type;
    private Boolean isActive;
}