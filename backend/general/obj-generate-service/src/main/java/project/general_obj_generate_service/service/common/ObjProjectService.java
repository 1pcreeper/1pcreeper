package project.general_obj_generate_service.service.common;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import project.general_obj_generate_service.constant.StreamBridgeTopics;
import project.general_obj_generate_service.model.dto.request.ProjectCreateCompletionRequestDTO;
import project.general_obj_generate_service.model.entity.ObjProject;
import project.general_obj_generate_service.model.entity.ProjectObject;
import project.general_obj_generate_service.model.entity.ProjectResource;
import project.general_obj_generate_service.model.entity.User;
import project.general_obj_generate_service.model.entity.enums.ProjectStatus;
import project.general_obj_generate_service.model.entity.enums.ResourceType;
import project.general_obj_generate_service.model.entity.enums.SourceType;
import project.general_obj_generate_service.model.event.ObjGenerationCreateTaskEvent;
import project.general_obj_generate_service.service.manager.ObjProjectManagerService;
import project.general_obj_generate_service.service.manager.ProjectObjectManagerService;
import project.general_obj_generate_service.service.manager.ProjectResourceManagerService;
import project.general_obj_generate_service.service.manager.UserManagerService;
import project.general_obj_generate_service.service.storage.StorageService;
import org.springframework.cloud.stream.function.StreamBridge;

@Slf4j
@Service
public class ObjProjectService {

    private final ObjProjectManagerService objProjectManagerService;
    private final ProjectObjectManagerService projectObjectManagerService;
    private final UserManagerService userManagerService;
    private final ProjectResourceManagerService resourceManagerService;
    private final StorageService storageService;
    private final StreamBridge streamBridge;

    @Autowired
    public ObjProjectService(
        ObjProjectManagerService objProjectManagerService,
        ProjectObjectManagerService projectObjectManagerService,
        UserManagerService userManagerService, 
        ProjectResourceManagerService resourceManagerService,
        StorageService storageService,
        StreamBridge streamBridge
    ) {
        this.objProjectManagerService = objProjectManagerService;
        this.projectObjectManagerService = projectObjectManagerService;
        this.userManagerService = userManagerService;
        this.resourceManagerService = resourceManagerService;
        this.storageService = storageService;
        this.streamBridge = streamBridge;
    }

    @Transactional
    public void completeGeneration(ProjectCreateCompletionRequestDTO requestDTO, Long projectId) {
        try {
            ObjProject existingObjProject = objProjectManagerService.findById(projectId);
            existingObjProject.setStatus(requestDTO.getStatus());
            
            if (ProjectStatus.READY.equals(requestDTO.getStatus())) {
                ProjectObject generatedMesh = new ProjectObject();
                generatedMesh.setProject(existingObjProject);
                generatedMesh.setObjectName(existingObjProject.getName() + " - Generated Asset");
                generatedMesh.setSourceType(SourceType.AI_GENERATED);
                generatedMesh.setViewGlbUrl(requestDTO.getViewGlbUrl());
                generatedMesh.setRawObjUrl(requestDTO.getRawObjUrl());
                
                projectObjectManagerService.save(generatedMesh);
                log.info("✨ [Service] Successfully saved new 3D mesh for Project {}", projectId);
            }
            objProjectManagerService.save(existingObjProject);
            log.info("✅ [Webhook] Finalized project {} with status {}", projectId, requestDTO.getStatus());

        } catch (Exception e) {
            log.error("❌ [Webhook] Failed to finalize project {}: {}", projectId, e.getMessage());
            throw new RuntimeException("Failed to complete project generation for ID: " + projectId, e);
        }
    }

    @Transactional
    public ObjProject createProject(String uid, String name, String prompt, MultipartFile referenceImage) {
        
        User currentUser = userManagerService.findByUid(uid);
        
        ObjProject newProject = ObjProject.builder()
            .name(name)
            .prompt(prompt)
            .status(ProjectStatus.PENDING)
            .build();
        
        newProject.setCreatedBy(currentUser);
        newProject = objProjectManagerService.save(newProject);
        
        String minioPath = storageService.uploadInputFile(newProject.getId(), referenceImage);
        
        ProjectResource resource = ProjectResource.builder()
            .project(newProject)
            .resourceType(ResourceType.REFERENCE_IMAGE)
            .minioUrl(minioPath)
            .fileName(referenceImage.getOriginalFilename())
            .build();

        resourceManagerService.save(resource);
        
        ObjGenerationCreateTaskEvent taskEvent = ObjGenerationCreateTaskEvent.builder()
            .projectId(newProject.getId())
            .minioInputPath(minioPath)
            .fileName(referenceImage.getOriginalFilename())
            .build();
        
        boolean isSent = streamBridge.send(StreamBridgeTopics.OBJ_TASK_CHANNEL, taskEvent);

        if (!isSent) {
            log.error("❌ [RabbitMQ] Failed to queue task for Project {}", newProject.getId());
            throw new RuntimeException("Message broker unavailable");
        }

        log.info("🚀 [Service] Project {} created and dispatched for generation!", newProject.getId());
        return newProject;
    }
}