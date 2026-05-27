package project.office_workforce_service.model.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
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
public class StaffCreateRequestDTO {

    @NotNull(message = "Company ID is required")
    private Long companyId;

    @NotNull(message = "Person ID is required")
    private Long personId;

    @NotNull(message = "Organization ID is required")
    private Long orgId;

    @Size(max = 255, message = "Custom ID must not exceed 255 characters")
    private String custId;

    @NotNull(message = "Work type is required (e.g., FULL_TIME, PART_TIME)")
    private WorkType type;

    @Valid // This tells Spring to validate the nested StaffDetailRequestDTO!
    @NotNull(message = "Staff details (like max working hours) are required")
    private StaffDetailRequestDTO details;
}