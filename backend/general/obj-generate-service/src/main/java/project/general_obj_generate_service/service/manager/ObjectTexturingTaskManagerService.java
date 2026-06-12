package project.general_obj_generate_service.service.manager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import project.general_obj_generate_service.model.entity.ObjectTexturingTask;
import project.general_obj_generate_service.model.entity.enums.ProjectStatus;
import project.general_obj_generate_service.repository.ObjectTexturingTaskRepository;
import project.general_obj_generate_service.service.base.AbstractBaseService;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ObjectTexturingTaskManagerService extends AbstractBaseService<ObjectTexturingTask, Integer> {

    private final ObjectTexturingTaskRepository objectTexturingTaskRepository;

    @Autowired
    public ObjectTexturingTaskManagerService(ObjectTexturingTaskRepository objectTexturingTaskRepository) {
        super(objectTexturingTaskRepository, "ObjectTexturingTask");
        this.objectTexturingTaskRepository = objectTexturingTaskRepository;
    }

    public Optional<ObjectTexturingTask> findByTaskId(UUID taskId) {
        return objectTexturingTaskRepository.findByTaskId(taskId);
    }

    public List<ObjectTexturingTask> findByProjectId(Integer projectId) {
        return objectTexturingTaskRepository.findByProjectId(projectId);
    }

    public List<ObjectTexturingTask> findByProjectIdAndStatus(Integer projectId, ProjectStatus status) {
        return objectTexturingTaskRepository.findByProjectIdAndStatus(projectId, status);
    }

    public Page<ObjectTexturingTask> searchTasks(Integer projectId, ProjectStatus status, Pageable pageable) {
        return objectTexturingTaskRepository.searchTasks(projectId, status, pageable);
    }
}