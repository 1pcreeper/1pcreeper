package project.office_workforce_service.controller.common;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import project.office_workforce_service.constant.UserRoles;
import project.office_workforce_service.model.dto.request.OrganizationCreateRequestDTO;
import project.office_workforce_service.model.dto.request.OrganizationUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.OrganizationResponseDTO;
import project.office_workforce_service.service.common.OrganizationService;
import project.shared_office_common_lib.constant.role.Roles;
import project.shared_office_starter.model.dto.base.APIBaseResponseDTO;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

import java.util.UUID;

@RestController
@RequestMapping({"/organizations", "/workforce/organizations"})
public class OrganizationController {

    private final OrganizationService organizationService;

    @Autowired
    public OrganizationController(OrganizationService organizationService) {
        this.organizationService = organizationService;
    }

    @Secured({UserRoles.WORKFORCE_ADMIN, Roles.OFFICE_ADMIN})
    @GetMapping("/search")
    public ResponseEntity<APIBaseResponseDTO<PaginationBaseResponseDTO<OrganizationResponseDTO>>> search(
        @RequestParam(required = false) String q,
        @RequestParam(required = false, defaultValue = "true") Boolean isActive,
        Pageable pageable
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(organizationService.search(q, isActive, pageable)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN, Roles.OFFICE_ADMIN})
    @GetMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<OrganizationResponseDTO>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(organizationService.findById(id)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN, Roles.OFFICE_ADMIN})
    @GetMapping("/uid/{uid}")
    public ResponseEntity<APIBaseResponseDTO<OrganizationResponseDTO>> findByUid(@PathVariable UUID uid) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(organizationService.findByUid(uid)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN, Roles.OFFICE_ADMIN})
    @GetMapping
    public ResponseEntity<APIBaseResponseDTO<PaginationBaseResponseDTO<OrganizationResponseDTO>>> findAll(
        @PageableDefault Pageable pageable
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(organizationService.findAll(pageable)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN, Roles.OFFICE_ADMIN})
    @PostMapping
    public ResponseEntity<APIBaseResponseDTO<OrganizationResponseDTO>> create(
        @Valid @RequestBody OrganizationCreateRequestDTO request
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(organizationService.create(request)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN, Roles.OFFICE_ADMIN})
    @PutMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<OrganizationResponseDTO>> update(
        @PathVariable Long id,
        @Valid @RequestBody OrganizationUpdateRequestDTO request
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(organizationService.update(id, request)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN, Roles.OFFICE_ADMIN})
    @DeleteMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<Void>> delete(@PathVariable Long id) {
        organizationService.delete(id);
        return ResponseEntity.ok(APIBaseResponseDTO.success(null));
    }
}
