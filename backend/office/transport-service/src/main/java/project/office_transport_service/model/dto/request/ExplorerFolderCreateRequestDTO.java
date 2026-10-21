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
public class ExplorerFolderCreateRequestDTO {
    private String parentPath;

    @NotBlank(message = "Folder name cannot be blank")
    private String folderName;
}
