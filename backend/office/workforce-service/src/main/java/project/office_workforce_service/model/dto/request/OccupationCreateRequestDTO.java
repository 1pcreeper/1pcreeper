package project.office_workforce_service.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OccupationCreateRequestDTO {

    @NotNull(message = "Organization ID is required")
    private Long orgId;

    @NotBlank(message = "Occupation name cannot be blank")
    private String name;
}