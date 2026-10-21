package project.office_transport_service.controller.common;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import project.office_transport_service.constant.UserRoles;
import project.office_transport_service.model.dto.request.ExplorerFolderCreateRequestDTO;
import project.office_transport_service.model.dto.request.ExplorerItemDeleteRequestDTO;
import project.office_transport_service.model.dto.request.ExplorerItemMoveRequestDTO;
import project.office_transport_service.model.dto.response.ExplorerItemResponseDTO;
import project.office_transport_service.model.dto.response.VehicleExplorerResponseDTO;
import project.office_transport_service.service.common.VehicleExplorerService;
import project.shared_office_common_lib.constant.role.Roles;
import project.shared_office_starter.model.dto.base.APIBaseResponseDTO;

@RestController
@RequestMapping("/vehicles/{id}/explorer")
public class VehicleExplorerController {

    private final VehicleExplorerService vehicleExplorerService;

    @Autowired
    public VehicleExplorerController(VehicleExplorerService vehicleExplorerService) {
        this.vehicleExplorerService = vehicleExplorerService;
    }

    @Secured({UserRoles.TRANSPORT_ADMIN, UserRoles.TRANSPORT_USER, Roles.OFFICE_ADMIN, Roles.OFFICE_USER})
    @GetMapping
    public ResponseEntity<APIBaseResponseDTO<VehicleExplorerResponseDTO>> getExplorerTree(
        @PathVariable Long id,
        @RequestParam(required = false) String folder
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(vehicleExplorerService.getExplorerTree(id, folder)));
    }

    @Secured({UserRoles.TRANSPORT_ADMIN, Roles.OFFICE_ADMIN})
    @PostMapping("/folders")
    public ResponseEntity<APIBaseResponseDTO<ExplorerItemResponseDTO>> createFolder(
        @PathVariable Long id,
        @Valid @RequestBody ExplorerFolderCreateRequestDTO requestDTO
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(vehicleExplorerService.createFolder(id, requestDTO)));
    }

    @Secured({UserRoles.TRANSPORT_ADMIN, Roles.OFFICE_ADMIN})
    @PostMapping(value = "/files", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<APIBaseResponseDTO<ExplorerItemResponseDTO>> uploadFile(
        @PathVariable Long id,
        @RequestParam("file") MultipartFile file,
        @RequestParam(required = false) String folderPath
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(vehicleExplorerService.uploadFile(id, file, folderPath)));
    }

    @Secured({UserRoles.TRANSPORT_ADMIN, Roles.OFFICE_ADMIN})
    @DeleteMapping("/items")
    public ResponseEntity<APIBaseResponseDTO<Void>> deleteItem(
        @PathVariable Long id,
        @Valid @RequestBody ExplorerItemDeleteRequestDTO requestDTO
    ) {
        vehicleExplorerService.deleteItem(id, requestDTO);
        return ResponseEntity.ok(APIBaseResponseDTO.success(null));
    }

    @Secured({UserRoles.TRANSPORT_ADMIN, Roles.OFFICE_ADMIN})
    @PutMapping("/move")
    public ResponseEntity<APIBaseResponseDTO<ExplorerItemResponseDTO>> moveItem(
        @PathVariable Long id,
        @Valid @RequestBody ExplorerItemMoveRequestDTO requestDTO
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(vehicleExplorerService.moveItem(id, requestDTO)));
    }

    @Secured({UserRoles.TRANSPORT_ADMIN, UserRoles.TRANSPORT_USER, Roles.OFFICE_ADMIN, Roles.OFFICE_USER})
    @GetMapping("/content")
    public ResponseEntity<Resource> downloadFile(
        @PathVariable Long id,
        @RequestParam String path
    ) {
        Resource resource = vehicleExplorerService.downloadFile(id, path);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
            .contentType(MediaType.APPLICATION_OCTET_STREAM)
            .body(resource);
    }
}
