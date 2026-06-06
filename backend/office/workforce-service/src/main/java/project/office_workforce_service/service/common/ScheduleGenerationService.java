package project.office_workforce_service.service.common;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.office_workforce_service.mapper.ScheduleGenerationTaskMapper;
import project.office_workforce_service.model.dto.response.ScheduleGenerationStatusResponseDTO;
import project.office_workforce_service.model.dto.response.ScheduleGenerationTaskResponseDTO;
import project.office_workforce_service.model.entity.ScheduleGenerationTask;
import project.office_workforce_service.model.entity.User;
import project.office_workforce_service.model.entity.enums.TaskStatus;
import project.office_workforce_service.service.manager.ScheduleGenerationTaskManagerService;
import project.office_workforce_service.service.manager.UserManagerService;
import project.office_workforce_service.service.worker.ScheduleGenerationTaskWorkerService;
import project.shared_office_starter.model.exception.TaskProcessingException;

import java.time.LocalDateTime;

@Service
public class ScheduleGenerationService {

    private final ScheduleGenerationTaskManagerService scheduleGenerationTaskManagerService;
    private final UserManagerService userManagerService;
    private final ScheduleGenerationTaskMapper scheduleGenerationTaskMapper;
    private final ScheduleGenerationTaskWorkerService scheduleGenerationTaskWorkerService;

    @Autowired
    public ScheduleGenerationService(
        ScheduleGenerationTaskManagerService scheduleGenerationTaskManagerService,
        UserManagerService userManagerService,
        ScheduleGenerationTaskMapper scheduleGenerationTaskMapper,
        ScheduleGenerationTaskWorkerService scheduleGenerationTaskWorkerService) {
        this.scheduleGenerationTaskManagerService = scheduleGenerationTaskManagerService;
        this.userManagerService = userManagerService;
        this.scheduleGenerationTaskMapper = scheduleGenerationTaskMapper;
        this.scheduleGenerationTaskWorkerService = scheduleGenerationTaskWorkerService;
    }
    
    public ScheduleGenerationTaskResponseDTO triggerGeneration(User senderUser) {
        if (scheduleGenerationTaskManagerService.existsByStatus(TaskStatus.PROCESSING)) {
            throw new TaskProcessingException("A schedule generation is already in progress. Please wait.");
        }
        return executeGeneration(senderUser);
    }

    public ScheduleGenerationTaskResponseDTO getTaskStatus(Long taskId) {
        ScheduleGenerationTask task = scheduleGenerationTaskManagerService.findById(taskId);
        return scheduleGenerationTaskMapper.toResponseDTO(task);
    }
    
    public ScheduleGenerationStatusResponseDTO getIsProcessing() {
        if (scheduleGenerationTaskManagerService.existsByStatus(TaskStatus.PROCESSING)) {
            return scheduleGenerationTaskMapper.toScheduleGenerationStatusResponseDTO(true);
        }
        return scheduleGenerationTaskMapper.toScheduleGenerationStatusResponseDTO(false);
    }
    
    @Transactional
    private ScheduleGenerationTaskResponseDTO executeGeneration(User senderUser) {
        ScheduleGenerationTask newTask = ScheduleGenerationTask.builder()
            .status(TaskStatus.PROCESSING)
            .requestedBy(senderUser)
            .startedAt(LocalDateTime.now())
            .build();
        ScheduleGenerationTask savedTask = scheduleGenerationTaskManagerService.save(newTask);
        scheduleGenerationTaskWorkerService.executeGeneration(savedTask.getId());

        return scheduleGenerationTaskMapper.toResponseDTO(savedTask);
    }
}