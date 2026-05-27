package project.office_workforce_service.model.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffOccupationCreateRequestDTO {

    @NotNull(message = "Staff ID is required")
    private Long staffId;

    @NotNull(message = "Occupation ID is required")
    private Long occupationId;

    private String remark;
}