package project.office_workforce_service.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationCreateRequestDTO {

    @NotNull(message = "Company ID is required")
    private Long companyId;

    @NotBlank(message = "Organization name cannot be blank")
    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String name;

    private String bio;
}