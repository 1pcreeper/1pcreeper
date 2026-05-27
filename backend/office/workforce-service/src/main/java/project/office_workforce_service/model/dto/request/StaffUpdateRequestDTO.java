package project.office_workforce_service.model.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.office_workforce_service.model.entity.enums.WorkType;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffUpdateRequestDTO {

    private Long orgId; // In case they get transferred to another branch

    @Size(max = 255)
    private String custId;

    private WorkType type;

    private Boolean isActive;

    @Valid
    private StaffDetailRequestDTO details;
}