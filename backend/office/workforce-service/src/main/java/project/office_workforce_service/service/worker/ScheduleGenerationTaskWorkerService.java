package project.office_workforce_service.service.worker;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.office_workforce_service.model.entity.ScheduleGenerationTask;
import project.office_workforce_service.model.entity.enums.TaskStatus;
import project.office_workforce_service.service.manager.ScheduleGenerationTaskManagerService;

import java.time.LocalDateTime;

@Slf4j
@Service
public class ScheduleGenerationTaskWorkerService {

    private final ScheduleGenerationTaskManagerService scheduleGenerationTaskManagerService;

    @Autowired
    public ScheduleGenerationTaskWorkerService(
        ScheduleGenerationTaskManagerService scheduleGenerationTaskManagerService
    ) {
        this.scheduleGenerationTaskManagerService = scheduleGenerationTaskManagerService;
    }

    @Async("threadPoolExecutor")
    @Transactional
    public void executeGeneration(Long taskId) {
        log.info("Starting schedule generation for Task ID: {}", taskId);

        ScheduleGenerationTask task = scheduleGenerationTaskManagerService.findById(taskId);

        try {
            // =========================================================
            // 🚀 YOUR AUTO-SCHEDULE GENERATION ALGORITHM GOES HERE!
            // 1. Fetch Place Rules
            // 2. Fetch Staff Preferences
            // 3. Apply constraints and match them up
            // 4. Save new Schedule entities
            // =========================================================

            // Simulating heavy CPU work...
            Thread.sleep(5000);
            
            task.setStatus(TaskStatus.COMPLETED);
            task.setCompletedAt(LocalDateTime.now());
            scheduleGenerationTaskManagerService.save(task);

            log.info("Successfully completed schedule generation for Task ID: {}", taskId);

        } catch (Exception e) {
            log.error("Failed schedule generation for Task ID: {}", taskId, e);
            
            task.setStatus(TaskStatus.FAILED);
            task.setCompletedAt(LocalDateTime.now());
            task.setErrorMessage(e.getMessage());
            scheduleGenerationTaskManagerService.save(task);
        }
    }
}