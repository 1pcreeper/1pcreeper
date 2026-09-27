package project.office_workforce_service.model.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentUpdateRequestDTO {

    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String name;

    private String bio;
}