package project.general_obj_generate_service.model.dto.request;

import lombok.Builder;
import lombok.Data;
import project.general_obj_generate_service.model.entity.enums.ProjectStatus;

@Data
@Builder
public class ProjectCreateCompletionRequestDTO {
    private ProjectStatus status;      // Should be "READY" or "FAILED"
    private String viewGlbUrl;  // e.g., "/3d-projects/outputs/105/scene.glb"
    private String rawObjUrl;   // e.g., "/3d-projects/outputs/105/scene.obj"
}
