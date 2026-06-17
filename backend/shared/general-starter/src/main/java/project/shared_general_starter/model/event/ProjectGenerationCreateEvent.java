package project.shared_general_starter.model.event;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ProjectGenerationCreateEvent {
    private Long projectId;
    private List<String> minioInputPaths;
}