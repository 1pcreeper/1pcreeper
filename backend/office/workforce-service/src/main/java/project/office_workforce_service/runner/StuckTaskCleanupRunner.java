package project.office_workforce_service.runner;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import project.office_workforce_service.service.manager.ScheduleGenerationTaskManagerService;

@Slf4j
@Component
public class StuckTaskCleanupRunner implements CommandLineRunner {

    private final ScheduleGenerationTaskManagerService scheduleGenerationTaskManagerService;

    @Autowired
    public StuckTaskCleanupRunner(
        ScheduleGenerationTaskManagerService scheduleGenerationTaskManagerService
    ) {
        this.scheduleGenerationTaskManagerService = scheduleGenerationTaskManagerService;
    }

    @Override
    public void run(String... args) {
        log.info("🧹 Boot-up Check: Sweeping for stuck schedule generation tasks...");

        try {
            int resetCount = loadResetting();
            
            if (resetCount > 0) {
                log.warn("⚠️ Sweeper found and reset {} orphaned task(s) from PROCESSING to FAILED.", resetCount);
            } else {
                log.info("✅ No stuck tasks found. Task system is clean.");
            }
        } catch (Exception e) {
            log.error("❌ Failed to clean up stuck tasks during startup.", e);
        }
    }
    
    private int loadResetting(){
        return scheduleGenerationTaskManagerService.resetStuckProcessingTasks();
    }
}