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
import project.shared_office_starter.model.dto.base.APIBaseResponseDTO;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

@RestController
@RequestMapping("/organizations")
public class OrganizationController {

    private final OrganizationService organizationService;

    @Autowired
    public OrganizationController(OrganizationService organizationService) {
        this.organizationService = organizationService;
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @GetMapping("/search")
    public ResponseEntity<APIBaseResponseDTO<PaginationBaseResponseDTO<OrganizationResponseDTO>>> search(
        @RequestParam(required = false) Long companyId,
        @RequestParam(required = false) String q,
        @RequestParam(required = false,defaultValue = "true") Boolean isActive,
        Pageable pageable
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(organizationService.search(companyId, q, isActive, pageable)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @GetMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<OrganizationResponseDTO>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(organizationService.findById(id)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @PostMapping
    public ResponseEntity<APIBaseResponseDTO<OrganizationResponseDTO>> create(@Valid @RequestBody OrganizationCreateRequestDTO request) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(organizationService.create(request)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @PutMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<OrganizationResponseDTO>> update(
        @PathVariable Long id, @Valid @RequestBody OrganizationUpdateRequestDTO request) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(organizationService.update(id, request)));
    }
    @Secured({UserRoles.WORKFORCE_ADMIN})
    @GetMapping()
    public ResponseEntity<APIBaseResponseDTO<PaginationBaseResponseDTO<OrganizationResponseDTO>>> findAll(@PageableDefault Pageable pageable){
        return ResponseEntity.ok(APIBaseResponseDTO.success(organizationService.findAll(pageable)));
    }
}