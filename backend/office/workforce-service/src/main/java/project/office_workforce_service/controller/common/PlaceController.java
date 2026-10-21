package project.office_workforce_service.controller.common;

import jakarta.annotation.Nullable;
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
import project.shared_office_common_lib.constant.role.Roles;
import project.shared_office_starter.model.dto.base.APIBaseResponseDTO;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

@RestController
@RequestMapping({"/places", "/workforce/places"})
public class PlaceController {

    private final PlaceService placeService;

    @Autowired
    public PlaceController(PlaceService placeService) {
        this.placeService = placeService;
    }

    @Secured({UserRoles.WORKFORCE_ADMIN, Roles.OFFICE_ADMIN})
    @GetMapping("/search")
    public ResponseEntity<APIBaseResponseDTO<PaginationBaseResponseDTO<PlaceResponseDTO>>> search(
        @RequestParam(required = false) Long companyId,
        @RequestParam(required = false) Long departId,
        @RequestParam(required = false) @Nullable String q,
        @RequestParam(required = false, defaultValue = "true") Boolean isActive,
        Pageable pageable) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(placeService.search(companyId, departId, q, isActive, pageable)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN, Roles.OFFICE_ADMIN})
    @GetMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<PlaceResponseDTO>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(placeService.findById(id)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN, Roles.OFFICE_ADMIN})
    @PostMapping
    public ResponseEntity<APIBaseResponseDTO<PlaceResponseDTO>> create(@Valid @RequestBody PlaceCreateRequestDTO request) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(placeService.create(request)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN, Roles.OFFICE_ADMIN})
    @PutMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<PlaceResponseDTO>> update(
        @PathVariable Long id, @Valid @RequestBody PlaceUpdateRequestDTO request) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(placeService.update(id, request)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN, Roles.OFFICE_ADMIN})
    @DeleteMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<Void>> delete(@PathVariable Long id) {
        placeService.delete(id);
        return ResponseEntity.ok(APIBaseResponseDTO.success(null));
    }
}