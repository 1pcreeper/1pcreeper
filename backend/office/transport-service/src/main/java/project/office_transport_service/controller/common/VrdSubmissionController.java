package project.office_transport_service.controller.common;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import project.office_transport_service.constant.UserRoles;
import project.office_transport_service.model.dto.request.VrdSubmissionApproveRequestDTO;
import project.office_transport_service.model.dto.request.VrdSubmissionDeclineRequestDTO;
import project.office_transport_service.model.dto.request.VrdSubmissionUpdateRequestDTO;
import project.office_transport_service.model.dto.response.VehicleVrdResponseDTO;
import project.office_transport_service.model.dto.response.VrdSubmissionResponseDTO;
import project.office_transport_service.service.common.VrdSubmissionService;
import project.shared_office_common_lib.constant.role.Roles;
import project.shared_office_starter.model.dto.base.APIBaseResponseDTO;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

import java.util.List;

@RestController
public class VrdSubmissionController {

    private final VrdSubmissionService vrdSubmissionService;

    @Autowired
    public VrdSubmissionController(VrdSubmissionService vrdSubmissionService) {
        this.vrdSubmissionService = vrdSubmissionService;
    }

    @Secured({UserRoles.TRANSPORT_ADMIN, Roles.OFFICE_ADMIN})
    @PostMapping(value = "/vehicles/{id}/scans/hk_vrds", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<APIBaseResponseDTO<VrdSubmissionResponseDTO>> uploadScan(
        @PathVariable Long id,
        @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(vrdSubmissionService.uploadScan(id, file)));
    }

    @Secured({UserRoles.TRANSPORT_ADMIN, UserRoles.TRANSPORT_USER, Roles.OFFICE_ADMIN, Roles.OFFICE_USER})
    @GetMapping("/vehicles/{id}/vrd-submissions")
    public ResponseEntity<APIBaseResponseDTO<List<VrdSubmissionResponseDTO>>> findByVehicleId(@PathVariable Long id) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(vrdSubmissionService.findByVehicleId(id)));
    }

    @Secured({UserRoles.TRANSPORT_ADMIN, Roles.OFFICE_ADMIN})
    @GetMapping("/vrd-submissions/pending")
    public ResponseEntity<APIBaseResponseDTO<PaginationBaseResponseDTO<VrdSubmissionResponseDTO>>> findPendingSubmissions(
        @PageableDefault Pageable pageable
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(vrdSubmissionService.findPendingSubmissions(pageable)));
    }

    @Secured({UserRoles.TRANSPORT_ADMIN, Roles.OFFICE_ADMIN})
    @PutMapping("/vehicles/{id}/vrd-submissions/{subId}")
    public ResponseEntity<APIBaseResponseDTO<VrdSubmissionResponseDTO>> updateSubmission(
        @PathVariable Long id,
        @PathVariable Long subId,
        @Valid @RequestBody VrdSubmissionUpdateRequestDTO requestDTO
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(vrdSubmissionService.updateSubmission(id, subId, requestDTO)));
    }

    @Secured({UserRoles.TRANSPORT_ADMIN, Roles.OFFICE_ADMIN})
    @PostMapping("/vehicles/{id}/vrd-submissions/{subId}/approve")
    public ResponseEntity<APIBaseResponseDTO<VehicleVrdResponseDTO>> approveSubmission(
        @PathVariable Long id,
        @PathVariable Long subId,
        @Valid @RequestBody VrdSubmissionApproveRequestDTO requestDTO
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(vrdSubmissionService.approveSubmission(id, subId, requestDTO)));
    }

    @Secured({UserRoles.TRANSPORT_ADMIN, Roles.OFFICE_ADMIN})
    @PostMapping("/vehicles/{id}/vrd-submissions/{subId}/decline")
    public ResponseEntity<APIBaseResponseDTO<VrdSubmissionResponseDTO>> declineSubmission(
        @PathVariable Long id,
        @PathVariable Long subId,
        @Valid @RequestBody VrdSubmissionDeclineRequestDTO requestDTO
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(vrdSubmissionService.declineSubmission(id, subId, requestDTO)));
    }
}
