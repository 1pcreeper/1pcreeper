package project.office_workforce_service.controller.common;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import project.office_workforce_service.constant.UserRoles;
import project.office_workforce_service.model.dto.response.ScheduleGenerationStatusResponseDTO;
import project.office_workforce_service.model.dto.response.ScheduleGenerationTaskResponseDTO;
import project.office_workforce_service.model.entity.User;
import project.office_workforce_service.service.common.ScheduleGenerationService;
import project.shared_office_starter.model.dto.base.APIBaseResponseDTO;

@RestController
@RequestMapping("/schedule-generations")
public class ScheduleGenerationController {

    private final ScheduleGenerationService scheduleGenerationService;

    @Autowired
    public ScheduleGenerationController(ScheduleGenerationService scheduleGenerationService) {
        this.scheduleGenerationService = scheduleGenerationService;
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @PostMapping("/trigger")
    public ResponseEntity<APIBaseResponseDTO<ScheduleGenerationTaskResponseDTO>> triggerGeneration(
        @AuthenticationPrincipal User user
    ) {
        ScheduleGenerationTaskResponseDTO response = scheduleGenerationService.triggerGeneration(user);
        return ResponseEntity.accepted().body(APIBaseResponseDTO.success(response));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @GetMapping("/{id}/status")
    public ResponseEntity<APIBaseResponseDTO<ScheduleGenerationTaskResponseDTO>> getTaskStatus(
        @PathVariable Long id
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(scheduleGenerationService.getTaskStatus(id)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @GetMapping("/process")
    public ResponseEntity<APIBaseResponseDTO<ScheduleGenerationStatusResponseDTO>> getIsProcessing() {
        return ResponseEntity.ok(APIBaseResponseDTO.success(scheduleGenerationService.getIsProcessing()));
    }
}