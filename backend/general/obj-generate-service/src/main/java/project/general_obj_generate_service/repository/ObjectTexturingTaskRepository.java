package project.general_obj_generate_service.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.general_obj_generate_service.model.entity.ObjectTexturingTask;
import project.general_obj_generate_service.model.entity.enums.ProjectStatus;
import project.general_obj_generate_service.repository.base.AbstractBaseRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ObjectTexturingTaskRepository extends AbstractBaseRepository<ObjectTexturingTask, Integer> {

    // Safely look up a task using the external UUID to prevent ID enumeration
    Optional<ObjectTexturingTask> findByTaskId(UUID taskId);

    // Fetch all texturing tasks for a specific project
    List<ObjectTexturingTask> findByProjectId(Integer projectId);

    // Useful for finding tasks that are currently stuck or still need processing
    List<ObjectTexturingTask> findByProjectIdAndStatus(Integer projectId, ProjectStatus status);

    // Advanced search for an admin or project dashboard
    @Query("SELECT t FROM ObjectTexturingTask t WHERE " +
        "t.projectId = :projectId AND " +
        "(:status IS NULL OR t.status = :status)")
    Page<ObjectTexturingTask> searchTasks(@Param("projectId") Integer projectId,
                                          @Param("status") ProjectStatus status,
                                          Pageable pageable);
}