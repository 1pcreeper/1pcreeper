package project.general_obj_generate_service.model.event;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ObjGenerationCreateTaskEvent {
    private Long projectId;
    private String minioInputPath;
    private String fileName;
}