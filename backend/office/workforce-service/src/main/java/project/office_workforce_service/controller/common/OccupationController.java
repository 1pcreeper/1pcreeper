package project.office_workforce_service.controller.common;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import project.office_workforce_service.constant.UserRoles;
import project.office_workforce_service.model.dto.request.OccupationCreateRequestDTO;
import project.office_workforce_service.model.dto.request.OccupationUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.OccupationResponseDTO;
import project.office_workforce_service.service.common.OccupationService;
import project.shared_office_starter.model.dto.base.APIBaseResponseDTO;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

@RestController
@RequestMapping("/occupations")
public class OccupationController {

    private final OccupationService occupationService;

    @Autowired
    public OccupationController(OccupationService occupationService) {
        this.occupationService = occupationService;
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @GetMapping("/search")
    public ResponseEntity<APIBaseResponseDTO<PaginationBaseResponseDTO<OccupationResponseDTO>>> search(
        @RequestParam(required = false) Long orgId,
        @RequestParam(required = false) String q,
        @RequestParam(required = false) Boolean isActive,
        Pageable pageable) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(occupationService.search(orgId, q, isActive, pageable)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @GetMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<OccupationResponseDTO>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(occupationService.findById(id)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @PostMapping
    public ResponseEntity<APIBaseResponseDTO<OccupationResponseDTO>> create(@Valid @RequestBody OccupationCreateRequestDTO request) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(occupationService.create(request)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @PutMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<OccupationResponseDTO>> update(
        @PathVariable Long id, @Valid @RequestBody OccupationUpdateRequestDTO request) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(occupationService.update(id, request)));
    }
}