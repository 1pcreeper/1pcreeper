package project.shared_general_starter.model.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Event triggered by obj-generate-service to notify hunyuan-ai-worker
 * that a specific 3D object needs UV mapping and texturing.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerateUVMappingObjectEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    // Unique task identifier to track the request
    private UUID taskId;

    // Database ID of the project for context
    private Integer projectId;

    // IDs of objects to paint
    private List<Integer> targetObjectIds;

    // IDs of textures provided by the user
    private List<Integer> customTextureResourceIds;

    // IDs of materials from your library
    private List<Integer> materialLibraryIds;

    // Mapping: Node Name -> Material Selection
    private Map<String, Object> textureMapping;

    // Callback URL or Queue name for the worker to report completion
    private String callbackQueue;
}