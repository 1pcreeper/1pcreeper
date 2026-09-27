package project.office_workforce_service.controller.common;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import project.office_workforce_service.constant.UserRoles;
import project.office_workforce_service.model.dto.request.WorkingPeriodCreateRequestDTO;
import project.office_workforce_service.model.dto.request.WorkingPeriodUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.WorkingPeriodResponseDTO;
import project.office_workforce_service.service.common.WorkingPeriodService;
import project.shared_office_common_lib.constant.role.Roles;
import project.shared_office_starter.model.dto.base.APIBaseResponseDTO;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

import java.time.LocalTime;

@RestController
@RequestMapping("/working-periods")
public class WorkingPeriodController {

    private final WorkingPeriodService workingPeriodService;

    @Autowired
    public WorkingPeriodController(WorkingPeriodService workingPeriodService) {
        this.workingPeriodService = workingPeriodService;
    }

    @Secured({UserRoles.WORKFORCE_ADMIN, Roles.OFFICE_ADMIN})
    @GetMapping("/search")
    public ResponseEntity<APIBaseResponseDTO<PaginationBaseResponseDTO<WorkingPeriodResponseDTO>>> search(
        @RequestParam(required = false) Long departId,
        @RequestParam(required = false) String q,
        @RequestParam(required = false) LocalTime startFrom,
        @RequestParam(required = false) LocalTime endTo,
        @RequestParam(required = false,defaultValue = "true") Boolean isActive,
        Pageable pageable) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(workingPeriodService.search(departId, q, startFrom, endTo, isActive, pageable)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN, Roles.OFFICE_ADMIN})
    @GetMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<WorkingPeriodResponseDTO>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(workingPeriodService.findById(id)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN, Roles.OFFICE_ADMIN})
    @PostMapping
    public ResponseEntity<APIBaseResponseDTO<WorkingPeriodResponseDTO>> create(@Valid @RequestBody WorkingPeriodCreateRequestDTO request) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(workingPeriodService.create(request)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN, Roles.OFFICE_ADMIN})
    @PutMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<WorkingPeriodResponseDTO>> update(
        @PathVariable Long id, @Valid @RequestBody WorkingPeriodUpdateRequestDTO request) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(workingPeriodService.update(id, request)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN, Roles.OFFICE_ADMIN})
    @DeleteMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<Void>> delete(@PathVariable Long id) {
        workingPeriodService.delete(id);
        return ResponseEntity.ok(APIBaseResponseDTO.success(null));
    }
    
}
