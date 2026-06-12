package project.general_obj_generate_service.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.general_obj_generate_service.model.entity.CustomObjectTask;
import project.general_obj_generate_service.model.entity.enums.ProjectStatus;
import project.general_obj_generate_service.model.entity.enums.ResourceType;
import project.general_obj_generate_service.repository.base.AbstractBaseRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomObjectTaskRepository extends AbstractBaseRepository<CustomObjectTask, Integer> {

    // Safely look up a task using the external UUID
    Optional<CustomObjectTask> findByTaskId(UUID taskId);

    // Fetch all custom object generation tasks for a specific project
    List<CustomObjectTask> findByProjectId(Integer projectId);

    // Filter tasks by their current status
    List<CustomObjectTask> findByProjectIdAndStatus(Integer projectId, ProjectStatus status);

    // Advanced search for paginated dashboard views
    @Query("SELECT t FROM CustomObjectTask t WHERE " +
        "t.projectId = :projectId AND " +
        "(:status IS NULL OR t.status = :status) AND " +
        "(:sourceType IS NULL OR t.generationSourceType = :sourceType)")
    Page<CustomObjectTask> searchTasks(@Param("projectId") Integer projectId,
                                       @Param("status") ProjectStatus status,
                                       @Param("sourceType") ResourceType sourceType,
                                       Pageable pageable);
}