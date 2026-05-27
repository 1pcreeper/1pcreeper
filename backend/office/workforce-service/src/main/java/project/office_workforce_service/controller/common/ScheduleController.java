package project.office_workforce_service.controller.common;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import project.office_workforce_service.constant.UserRoles;
import project.office_workforce_service.model.dto.request.ScheduleCreateRequestDTO;
import project.office_workforce_service.model.dto.request.ScheduleStatusUpdateRequestDTO;
import project.office_workforce_service.model.dto.request.ScheduleUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.ScheduleResponseDTO;
import project.office_workforce_service.model.entity.enums.ScheduleStatus;
import project.office_workforce_service.service.common.ScheduleService;
import project.shared_office_starter.model.dto.base.APIBaseResponseDTO;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;

    @Autowired
    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @GetMapping("/search")
    public ResponseEntity<APIBaseResponseDTO<PaginationBaseResponseDTO<ScheduleResponseDTO>>> search(
        @RequestParam(required = false) Long placeId,
        @RequestParam(required = false) Long staffId,
        @RequestParam(required = false) ScheduleStatus status,
        @RequestParam(required = false) LocalDateTime startFrom,
        @RequestParam(required = false) LocalDateTime endTo,
        Pageable pageable) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(scheduleService.search(placeId, staffId, status, startFrom, endTo, pageable)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @GetMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<ScheduleResponseDTO>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(scheduleService.findById(id)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @PostMapping
    public ResponseEntity<APIBaseResponseDTO<ScheduleResponseDTO>> create(@Valid @RequestBody ScheduleCreateRequestDTO request) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(scheduleService.create(request)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @PutMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<ScheduleResponseDTO>> update(
        @PathVariable Long id, @Valid @RequestBody ScheduleUpdateRequestDTO request) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(scheduleService.update(id, request)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @PatchMapping("/{id}/status")
    public ResponseEntity<APIBaseResponseDTO<ScheduleResponseDTO>> updateStatus(
        @PathVariable Long id, @Valid @RequestBody ScheduleStatusUpdateRequestDTO request) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(scheduleService.updateStatus(id, request)));
    }
}