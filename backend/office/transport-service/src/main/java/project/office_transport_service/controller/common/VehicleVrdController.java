package project.office_transport_service.controller.common;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import project.office_transport_service.constant.UserRoles;
import project.office_transport_service.model.dto.request.VehicleVrdCreateRequestDTO;
import project.office_transport_service.model.dto.request.VehicleVrdUpdateRequestDTO;
import project.office_transport_service.model.dto.response.VehicleVrdResponseDTO;
import project.office_transport_service.service.common.VehicleVrdService;
import project.shared_office_common_lib.constant.role.Roles;
import project.shared_office_starter.model.dto.base.APIBaseResponseDTO;

import java.util.List;

@RestController
public class VehicleVrdController {

    private final VehicleVrdService vehicleVrdService;

    @Autowired
    public VehicleVrdController(VehicleVrdService vehicleVrdService) {
        this.vehicleVrdService = vehicleVrdService;
    }

    @Secured({UserRoles.TRANSPORT_ADMIN, UserRoles.TRANSPORT_USER, Roles.OFFICE_ADMIN, Roles.OFFICE_USER})
    @GetMapping("/vehicles/{id}/vrds")
    public ResponseEntity<APIBaseResponseDTO<List<VehicleVrdResponseDTO>>> findVrdsByVehicleId(@PathVariable Long id) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(vehicleVrdService.findVrdsByVehicleId(id)));
    }

    @Secured({UserRoles.TRANSPORT_ADMIN, UserRoles.TRANSPORT_USER, Roles.OFFICE_ADMIN, Roles.OFFICE_USER})
    @GetMapping("/vrds/{vrdId}")
    public ResponseEntity<APIBaseResponseDTO<VehicleVrdResponseDTO>> findById(@PathVariable Long vrdId) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(vehicleVrdService.findById(vrdId)));
    }

    @Secured({UserRoles.TRANSPORT_ADMIN, Roles.OFFICE_ADMIN})
    @PostMapping("/vehicles/{id}/vrds")
    public ResponseEntity<APIBaseResponseDTO<VehicleVrdResponseDTO>> createVrd(
        @PathVariable Long id,
        @Valid @RequestBody VehicleVrdCreateRequestDTO requestDTO
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(vehicleVrdService.createVrd(id, requestDTO)));
    }

    @Secured({UserRoles.TRANSPORT_ADMIN, Roles.OFFICE_ADMIN})
    @PutMapping("/vrds/{vrdId}")
    public ResponseEntity<APIBaseResponseDTO<VehicleVrdResponseDTO>> updateVrd(
        @PathVariable Long vrdId,
        @Valid @RequestBody VehicleVrdUpdateRequestDTO requestDTO
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(vehicleVrdService.updateVrd(vrdId, requestDTO)));
    }
}
