package project.office_workforce_service.controller.common;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import project.office_workforce_service.constant.UserRoles;
import project.office_workforce_service.model.dto.request.OrganizationDetailRequestDTO;
import project.office_workforce_service.model.dto.response.OrganizationDetailResponseDTO;
import project.office_workforce_service.service.common.OrganizationDetailService;
import project.shared_office_common_lib.constant.role.Roles;
import project.shared_office_starter.model.dto.base.APIBaseResponseDTO;

@RestController
@RequestMapping({"/organizations/{orgId}/details", "/workforce/organizations/{orgId}/details"})
public class OrganizationDetailController {

    private final OrganizationDetailService organizationDetailService;

    @Autowired
    public OrganizationDetailController(OrganizationDetailService organizationDetailService) {
        this.organizationDetailService = organizationDetailService;
    }

    @Secured({UserRoles.WORKFORCE_ADMIN, Roles.OFFICE_ADMIN})
    @GetMapping
    public ResponseEntity<APIBaseResponseDTO<OrganizationDetailResponseDTO>> findByOrgId(@PathVariable Long orgId) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(organizationDetailService.findByOrgId(orgId)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN, Roles.OFFICE_ADMIN})
    @PutMapping
    public ResponseEntity<APIBaseResponseDTO<OrganizationDetailResponseDTO>> upsert(
        @PathVariable Long orgId,
        @Valid @RequestBody OrganizationDetailRequestDTO request
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(organizationDetailService.upsert(orgId, request)));
    }
}
