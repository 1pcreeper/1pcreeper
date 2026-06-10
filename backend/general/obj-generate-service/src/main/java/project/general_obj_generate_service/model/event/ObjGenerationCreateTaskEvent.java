package project.general_obj_generate_service.model.event;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ObjGenerationCreateTaskEvent {
    private Long projectId;
    private List<String> minioInputPaths;
}