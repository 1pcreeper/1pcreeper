package project.office_workforce_service.controller.common;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import project.office_workforce_service.constant.UserRoles;
import project.office_workforce_service.model.dto.request.StaffSchedulePreferenceCreateRequestDTO;
import project.office_workforce_service.model.dto.request.StaffSchedulePreferenceUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.StaffSchedulePreferenceResponseDTO;
import project.office_workforce_service.service.common.StaffSchedulePreferenceService;
import project.shared_office_starter.model.dto.base.APIBaseResponseDTO;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

@RestController
@RequestMapping("/staff-schedule-preferences")
public class StaffSchedulePreferenceController {

    private final StaffSchedulePreferenceService preferenceService;

    @Autowired
    public StaffSchedulePreferenceController(StaffSchedulePreferenceService preferenceService) {
        this.preferenceService = preferenceService;
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @GetMapping("/search")
    public ResponseEntity<APIBaseResponseDTO<PaginationBaseResponseDTO<StaffSchedulePreferenceResponseDTO>>> search(
        @RequestParam(required = false) Long staffId,
        @RequestParam(required = false) Long placeId,
        @RequestParam(required = false) Integer weekDay,
        Pageable pageable) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(preferenceService.search(staffId, placeId, weekDay, pageable)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @GetMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<StaffSchedulePreferenceResponseDTO>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(preferenceService.findById(id)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @PostMapping
    public ResponseEntity<APIBaseResponseDTO<StaffSchedulePreferenceResponseDTO>> create(
        @Valid @RequestBody StaffSchedulePreferenceCreateRequestDTO request) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(preferenceService.create(request)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @PutMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<StaffSchedulePreferenceResponseDTO>> update(
        @PathVariable Long id, @Valid @RequestBody StaffSchedulePreferenceUpdateRequestDTO request) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(preferenceService.update(id, request)));
    }
}