package project.office_workforce_service.controller.common;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import project.office_workforce_service.constant.UserRoles;
import project.office_workforce_service.model.dto.request.StaffOccupationCreateRequestDTO;
import project.office_workforce_service.model.dto.request.StaffOccupationUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.StaffOccupationResponseDTO;
import project.office_workforce_service.service.common.StaffOccupationService;
import project.shared_office_starter.model.dto.base.APIBaseResponseDTO;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

@RestController
@RequestMapping("/staff-occupations")
public class StaffOccupationController {

    private final StaffOccupationService staffOccupationService;

    @Autowired
    public StaffOccupationController(StaffOccupationService staffOccupationService) {
        this.staffOccupationService = staffOccupationService;
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @GetMapping("/search")
    public ResponseEntity<APIBaseResponseDTO<PaginationBaseResponseDTO<StaffOccupationResponseDTO>>> search(
        @RequestParam(required = false) Long staffId,
        @RequestParam(required = false) Long occupationId,
        @RequestParam(required = false) String q,
        Pageable pageable) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(staffOccupationService.search(staffId, occupationId, q, pageable)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @GetMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<StaffOccupationResponseDTO>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(staffOccupationService.findById(id)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @PostMapping
    public ResponseEntity<APIBaseResponseDTO<StaffOccupationResponseDTO>> create(@Valid @RequestBody StaffOccupationCreateRequestDTO request) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(staffOccupationService.create(request)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @PutMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<StaffOccupationResponseDTO>> update(
        @PathVariable Long id, @Valid @RequestBody StaffOccupationUpdateRequestDTO request) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(staffOccupationService.update(id, request)));
    }
}