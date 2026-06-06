package project.office_workforce_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.office_workforce_service.model.entity.ScheduleGenerationTask;
import project.office_workforce_service.model.entity.enums.TaskStatus;
import project.office_workforce_service.repository.base.AbstractBaseRepository;

import java.util.List;

@Repository
public interface ScheduleGenerationTaskRepository extends AbstractBaseRepository<ScheduleGenerationTask, Long> {

    List<ScheduleGenerationTask> findByStatus(TaskStatus status);
    boolean existsByStatus(TaskStatus status);
}