package project.office_workforce_service.controller.common;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import project.office_workforce_service.constant.UserRoles;
import project.office_workforce_service.model.dto.request.PlaceCreateRequestDTO;
import project.office_workforce_service.model.dto.request.PlaceUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.PlaceResponseDTO;
import project.office_workforce_service.service.common.PlaceService;
import project.shared_office_starter.model.dto.base.APIBaseResponseDTO;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

@RestController
@RequestMapping("/places")
public class PlaceController {

    private final PlaceService placeService;

    @Autowired
    public PlaceController(PlaceService placeService) {
        this.placeService = placeService;
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @GetMapping("/search")
    public ResponseEntity<APIBaseResponseDTO<PaginationBaseResponseDTO<PlaceResponseDTO>>> search(
        @RequestParam(required = false) Long orgId,
        @RequestParam(required = false) String q,
        @RequestParam(required = false) Boolean isActive,
        Pageable pageable) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(placeService.search(orgId, q, isActive, pageable)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @GetMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<PlaceResponseDTO>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(placeService.findById(id)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @PostMapping
    public ResponseEntity<APIBaseResponseDTO<PlaceResponseDTO>> create(@Valid @RequestBody PlaceCreateRequestDTO request) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(placeService.create(request)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @PutMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<PlaceResponseDTO>> update(
        @PathVariable Long id, @Valid @RequestBody PlaceUpdateRequestDTO request) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(placeService.update(id, request)));
    }
}