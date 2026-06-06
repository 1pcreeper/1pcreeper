package project.office_workforce_service.mapper;

import org.springframework.stereotype.Component;
import project.office_workforce_service.model.dto.response.ScheduleGenerationStatusResponseDTO;
import project.office_workforce_service.model.dto.response.ScheduleGenerationTaskResponseDTO;
import project.office_workforce_service.model.entity.ScheduleGenerationTask;

@Component
public class ScheduleGenerationTaskMapper {

    public ScheduleGenerationTaskResponseDTO toResponseDTO(ScheduleGenerationTask task) {
        if (task == null) return null;

        return ScheduleGenerationTaskResponseDTO.builder()
            .id(task.getId())
            .status(task.getStatus())
            .requestedByUid(task.getRequestedBy() != null ? task.getRequestedBy().getUid() : null)
            .startedAt(task.getStartedAt())
            .completedAt(task.getCompletedAt())
            .errorMessage(task.getErrorMessage())
            .build();
    }
    
    public ScheduleGenerationStatusResponseDTO toScheduleGenerationStatusResponseDTO(boolean isProcessing){
        return ScheduleGenerationStatusResponseDTO.builder()
            .isProcessing(isProcessing)
            .build();
    }
}