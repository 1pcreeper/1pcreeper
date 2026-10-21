package project.office_transport_service.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExplorerItemMoveRequestDTO {
    @NotBlank(message = "Source path cannot be blank")
    private String sourcePath;

    @NotBlank(message = "Target path cannot be blank")
    private String targetPath;
}
