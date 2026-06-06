package project.office_workforce_service.service.manager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.office_workforce_service.model.entity.ScheduleGenerationTask;
import project.office_workforce_service.model.entity.enums.TaskStatus;
import project.office_workforce_service.repository.ScheduleGenerationTaskRepository;
import project.office_workforce_service.service.base.AbstractBaseService;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ScheduleGenerationTaskManagerService extends AbstractBaseService<ScheduleGenerationTask, Long> {

    private final ScheduleGenerationTaskRepository scheduleGenerationTaskRepository;

    @Autowired
    public ScheduleGenerationTaskManagerService(ScheduleGenerationTaskRepository scheduleGenerationTaskRepository) {
        super(scheduleGenerationTaskRepository,"ScheduleGenerationTask");
        this.scheduleGenerationTaskRepository = scheduleGenerationTaskRepository;
    }

    public boolean existsByStatus(TaskStatus status) {
        return scheduleGenerationTaskRepository.existsByStatus(status);
    }

    @Transactional
    public int resetStuckProcessingTasks() {
        List<ScheduleGenerationTask> stuckTasks = scheduleGenerationTaskRepository.findByStatus(TaskStatus.PROCESSING);
        if (stuckTasks.isEmpty()) {
            return 0;
        }
        LocalDateTime now = LocalDateTime.now();
        stuckTasks.forEach(task -> {
            task.setStatus(TaskStatus.FAILED);
            task.setErrorMessage("Task interrupted and failed due to unexpected server restart.");
            task.setCompletedAt(now);
        });
        scheduleGenerationTaskRepository.saveAll(stuckTasks);
        return stuckTasks.size();
    }
}