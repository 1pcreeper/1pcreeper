package project.office_transport_service.controller.common;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import project.office_transport_service.constant.UserRoles;
import project.office_transport_service.model.dto.request.VehicleAvatarUpdateRequestDTO;
import project.office_transport_service.model.dto.request.VehicleCreateRequestDTO;
import project.office_transport_service.model.dto.request.VehicleUpdateRequestDTO;
import project.office_transport_service.model.dto.request.VehicleVrdExpiryUpdateRequestDTO;
import project.office_transport_service.model.dto.response.VehicleDetailResponseDTO;
import project.office_transport_service.model.dto.response.VehicleResponseDTO;
import project.office_transport_service.service.common.VehicleService;
import project.shared_office_common_lib.constant.role.Roles;
import project.shared_office_starter.model.dto.base.APIBaseResponseDTO;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

import java.util.UUID;

@RestController
@RequestMapping("/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    @Autowired
    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @Secured({UserRoles.TRANSPORT_ADMIN, UserRoles.TRANSPORT_USER, Roles.OFFICE_ADMIN, Roles.OFFICE_USER})
    @GetMapping
    public ResponseEntity<APIBaseResponseDTO<PaginationBaseResponseDTO<VehicleResponseDTO>>> findAll(
        @PageableDefault Pageable pageable
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(vehicleService.findAll(pageable)));
    }

    @Secured({UserRoles.TRANSPORT_ADMIN, UserRoles.TRANSPORT_USER, Roles.OFFICE_ADMIN, Roles.OFFICE_USER})
    @GetMapping("/search")
    public ResponseEntity<APIBaseResponseDTO<PaginationBaseResponseDTO<VehicleResponseDTO>>> search(
        @RequestParam(required = false) String q,
        @RequestParam(required = false) UUID personUid,
        @RequestParam(required = false, defaultValue = "true") Boolean isActive,
        @PageableDefault Pageable pageable
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(vehicleService.search(q, personUid, isActive, pageable)));
    }

    @Secured({UserRoles.TRANSPORT_ADMIN, UserRoles.TRANSPORT_USER, Roles.OFFICE_ADMIN, Roles.OFFICE_USER})
    @GetMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<VehicleResponseDTO>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(vehicleService.findById(id)));
    }

    @Secured({UserRoles.TRANSPORT_ADMIN, UserRoles.TRANSPORT_USER, Roles.OFFICE_ADMIN, Roles.OFFICE_USER})
    @GetMapping("/uid/{uid}")
    public ResponseEntity<APIBaseResponseDTO<VehicleResponseDTO>> findByUid(@PathVariable UUID uid) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(vehicleService.findByUid(uid)));
    }

    @Secured({UserRoles.TRANSPORT_ADMIN, UserRoles.TRANSPORT_USER, Roles.OFFICE_ADMIN, Roles.OFFICE_USER})
    @GetMapping("/details/{id}")
    public ResponseEntity<APIBaseResponseDTO<VehicleDetailResponseDTO>> findByIdInDetail(@PathVariable Long id) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(vehicleService.findByIdInDetail(id)));
    }

    @Secured({UserRoles.TRANSPORT_ADMIN, Roles.OFFICE_ADMIN})
    @PostMapping
    public ResponseEntity<APIBaseResponseDTO<VehicleResponseDTO>> create(
        @Valid @RequestBody VehicleCreateRequestDTO requestDTO
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(vehicleService.create(requestDTO)));
    }

    @Secured({UserRoles.TRANSPORT_ADMIN, Roles.OFFICE_ADMIN})
    @PutMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<VehicleResponseDTO>> update(
        @PathVariable Long id,
        @Valid @RequestBody VehicleUpdateRequestDTO requestDTO
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(vehicleService.update(id, requestDTO)));
    }

    @Secured({UserRoles.TRANSPORT_ADMIN, Roles.OFFICE_ADMIN})
    @DeleteMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<Void>> delete(@PathVariable Long id) {
        vehicleService.delete(id);
        return ResponseEntity.ok(APIBaseResponseDTO.success(null));
    }

    @Secured({UserRoles.TRANSPORT_ADMIN, Roles.OFFICE_ADMIN})
    @PutMapping("/{id}/avatar")
    public ResponseEntity<APIBaseResponseDTO<VehicleResponseDTO>> updateAvatar(
        @PathVariable Long id,
        @Valid @RequestBody VehicleAvatarUpdateRequestDTO requestDTO
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(vehicleService.updateAvatar(id, requestDTO)));
    }

    @Secured({UserRoles.TRANSPORT_ADMIN, Roles.OFFICE_ADMIN})
    @PutMapping("/{id}/vrd-expiry")
    public ResponseEntity<APIBaseResponseDTO<VehicleResponseDTO>> updateVrdExpiry(
        @PathVariable Long id,
        @Valid @RequestBody VehicleVrdExpiryUpdateRequestDTO requestDTO
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(vehicleService.updateVrdExpiry(id, requestDTO)));
    }
}
