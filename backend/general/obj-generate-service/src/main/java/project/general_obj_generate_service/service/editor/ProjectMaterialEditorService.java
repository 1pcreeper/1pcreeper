package project.general_obj_generate_service.service.editor;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.stream.function.StreamBridge;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.shared_general_common_lib.constant.StreamBridgeTopicsConstant;
import project.general_obj_generate_service.model.entity.ObjectTexturingTask;
import project.general_obj_generate_service.model.entity.enums.ProjectStatus;
import project.shared_general_starter.model.event.GenerateUVMappingObjectEvent;
import project.general_obj_generate_service.service.manager.*;
import project.general_obj_generate_service.service.storage.StorageService;
import project.shared_general_starter.service.producer.KafkaHunyuanProducerService;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class ProjectMaterialEditorService {
    private final ObjProjectManagerService objProjectManagerService;
    private final ProjectObjectManagerService projectObjectManagerService;
    private final UserManagerService userManagerService;
    private final ProjectResourceManagerService resourceManagerService;
    private final StorageService storageService;
    private final StreamBridge streamBridge;
    private final ObjectTexturingTaskManagerService objectTexturingTaskManagerService;
    private final KafkaHunyuanProducerService kafkaHunyuanProducerService;

    @Autowired
    public ProjectMaterialEditorService(
        ObjProjectManagerService objProjectManagerService,
        ProjectObjectManagerService projectObjectManagerService,
        UserManagerService userManagerService,
        ProjectResourceManagerService projectResourceManagerService,
        StorageService storageService,
        StreamBridge streamBridge,
        ObjectTexturingTaskManagerService objectTexturingTaskManagerService,
        KafkaHunyuanProducerService kafkaHunyuanProducerService
    ) {
        this.objProjectManagerService = objProjectManagerService;
        this.projectObjectManagerService = projectObjectManagerService;
        this.userManagerService = userManagerService;
        this.resourceManagerService = projectResourceManagerService;
        this.storageService = storageService;
        this.streamBridge = streamBridge;
        this.objectTexturingTaskManagerService = objectTexturingTaskManagerService;
        this.kafkaHunyuanProducerService = kafkaHunyuanProducerService;
    }
    /**
     * Triggers the Hunyuan AI painting process.
     */
    @Transactional
    public ObjectTexturingTask triggerTextureGeneration(
        Integer projectId,
        List<Integer> objectIds,
        List<Integer> customResourceIds,
        List<Integer> materialLibraryIds,
        Map<String, Object> mapping) {

        log.info("🚀 Triggering AI painting for Project ID: {}", projectId);

        // 1. Create a tracking task in the DB
        ObjectTexturingTask newTask = new ObjectTexturingTask();
        newTask.setProjectId(projectId);
        newTask.setTargetObjectIds(objectIds);
        newTask.setCustomTextureResourceIds(customResourceIds);
        newTask.setMaterialLibraryIds(materialLibraryIds);
        newTask.setTextureMapping(mapping);
        newTask.setStatus(ProjectStatus.PENDING);

        ObjectTexturingTask savedTask = objectTexturingTaskManagerService.save(newTask);

        GenerateUVMappingObjectEvent event = GenerateUVMappingObjectEvent.builder()
            .taskId(savedTask.getTaskId())
            .projectId(projectId)
            .targetObjectIds(objectIds)
            .customTextureResourceIds(customResourceIds)
            .materialLibraryIds(materialLibraryIds)
            .textureMapping(mapping)
            .build();

        // 3. Send via StreamBridge
        boolean sent = kafkaHunyuanProducerService.produceGenerateUVMappingObjectEvent(event);

        if (!sent) {
            log.error("❌ Failed to push event to RabbitMQ for Task: {}", savedTask.getTaskId());
            throw new RuntimeException("AI Worker is currently offline.");
        }

        return savedTask;
    }
    
}
