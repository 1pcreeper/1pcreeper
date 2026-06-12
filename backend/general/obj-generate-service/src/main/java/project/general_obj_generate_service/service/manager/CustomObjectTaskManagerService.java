package project.general_obj_generate_service.service.manager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import project.general_obj_generate_service.model.entity.CustomObjectTask;
import project.general_obj_generate_service.model.entity.enums.ProjectStatus;
import project.general_obj_generate_service.model.entity.enums.ResourceType;
import project.general_obj_generate_service.repository.CustomObjectTaskRepository;
import project.general_obj_generate_service.service.base.AbstractBaseService;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CustomObjectTaskManagerService extends AbstractBaseService<CustomObjectTask, Integer> {

    private final CustomObjectTaskRepository customObjectTaskRepository;

    @Autowired
    public CustomObjectTaskManagerService(CustomObjectTaskRepository customObjectTaskRepository) {
        super(customObjectTaskRepository, "CustomObjectTask");
        this.customObjectTaskRepository = customObjectTaskRepository;
    }

    public Optional<CustomObjectTask> findByTaskId(UUID taskId) {
        return customObjectTaskRepository.findByTaskId(taskId);
    }

    public List<CustomObjectTask> findByProjectId(Integer projectId) {
        return customObjectTaskRepository.findByProjectId(projectId);
    }

    public List<CustomObjectTask> findByProjectIdAndStatus(Integer projectId, ProjectStatus status) {
        return customObjectTaskRepository.findByProjectIdAndStatus(projectId, status);
    }

    public Page<CustomObjectTask> searchTasks(Integer projectId, ProjectStatus status, ResourceType sourceType, Pageable pageable) {
        return customObjectTaskRepository.searchTasks(projectId, status, sourceType, pageable);
    }
}