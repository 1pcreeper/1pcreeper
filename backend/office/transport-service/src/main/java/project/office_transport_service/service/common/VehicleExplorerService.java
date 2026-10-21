package project.office_transport_service.service.common;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import project.office_transport_service.model.dto.object.ExplorerItemDTO;
import project.office_transport_service.model.dto.request.ExplorerFolderCreateRequestDTO;
import project.office_transport_service.model.dto.request.ExplorerItemDeleteRequestDTO;
import project.office_transport_service.model.dto.request.ExplorerItemMoveRequestDTO;
import project.office_transport_service.model.dto.response.ExplorerItemResponseDTO;
import project.office_transport_service.model.dto.response.VehicleExplorerResponseDTO;
import project.office_transport_service.model.entity.Vehicle;
import project.office_transport_service.service.manager.VehicleManagerService;
import project.office_transport_service.service.storage.VehicleExplorerStorageService;
import project.shared_office_starter.model.exception.PropertyValidationException;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class VehicleExplorerService {

    private final VehicleManagerService vehicleManagerService;
    private final VehicleExplorerStorageService vehicleExplorerStorageService;

    @Autowired
    public VehicleExplorerService(
        VehicleManagerService vehicleManagerService,
        VehicleExplorerStorageService vehicleExplorerStorageService
    ) {
        this.vehicleManagerService = vehicleManagerService;
        this.vehicleExplorerStorageService = vehicleExplorerStorageService;
    }

    public VehicleExplorerResponseDTO getExplorerTree(Long vehicleId, String folder) {
        Vehicle vehicle = vehicleManagerService.findById(vehicleId);
        List<ExplorerItemDTO> items = vehicleExplorerStorageService.listDirectory(vehicle.getUid(), folder);

        List<ExplorerItemResponseDTO> responseItems = items.stream()
            .map(this::toResponseDTO)
            .collect(Collectors.toList());

        boolean hasWarnings = responseItems.stream().anyMatch(item -> Boolean.FALSE.equals(item.getIsAccessible()));

        return VehicleExplorerResponseDTO.builder()
            .vehicleId(vehicle.getId())
            .vehicleUid(vehicle.getUid())
            .currentFolder(folder != null ? folder : "")
            .items(responseItems)
            .hasWarnings(hasWarnings)
            .build();
    }

    public ExplorerItemResponseDTO createFolder(Long vehicleId, ExplorerFolderCreateRequestDTO requestDTO) {
        Vehicle vehicle = vehicleManagerService.findById(vehicleId);
        ExplorerItemDTO item = vehicleExplorerStorageService.createFolder(
            vehicle.getUid(),
            requestDTO.getParentPath(),
            requestDTO.getFolderName()
        );
        return toResponseDTO(item);
    }

    public ExplorerItemResponseDTO uploadFile(Long vehicleId, MultipartFile file, String folderPath) {
        Vehicle vehicle = vehicleManagerService.findById(vehicleId);
        if (file == null || file.isEmpty()) {
            throw new PropertyValidationException("Uploaded file cannot be empty");
        }

        try (InputStream is = file.getInputStream()) {
            String originalName = file.getOriginalFilename();
            if (originalName == null || originalName.isBlank()) {
                originalName = "upload_" + System.currentTimeMillis();
            }

            ExplorerItemDTO item = vehicleExplorerStorageService.saveFile(
                vehicle.getUid(),
                folderPath,
                originalName,
                is,
                file.getSize()
            );
            return toResponseDTO(item);
        } catch (IOException e) {
            throw new PropertyValidationException("Failed to read uploaded file: " + e.getMessage());
        }
    }

    public void deleteItem(Long vehicleId, ExplorerItemDeleteRequestDTO requestDTO) {
        Vehicle vehicle = vehicleManagerService.findById(vehicleId);
        vehicleExplorerStorageService.deleteItem(vehicle.getUid(), requestDTO.getRelativePath());
    }

    public ExplorerItemResponseDTO moveItem(Long vehicleId, ExplorerItemMoveRequestDTO requestDTO) {
        Vehicle vehicle = vehicleManagerService.findById(vehicleId);
        ExplorerItemDTO item = vehicleExplorerStorageService.moveOrRename(
            vehicle.getUid(),
            requestDTO.getSourcePath(),
            requestDTO.getTargetPath()
        );
        return toResponseDTO(item);
    }

    public Resource downloadFile(Long vehicleId, String path) {
        Vehicle vehicle = vehicleManagerService.findById(vehicleId);
        Optional<InputStream> streamOpt = vehicleExplorerStorageService.readFile(vehicle.getUid(), path);

        if (streamOpt.isEmpty()) {
            throw new ResourceNotFoundException("File not found on disk at relative path: " + path);
        }

        return new InputStreamResource(streamOpt.get()) {
            @Override
            public String getFilename() {
                if (path == null) return "file";
                int lastSlash = path.lastIndexOf('/');
                return lastSlash >= 0 ? path.substring(lastSlash + 1) : path;
            }
        };
    }

    private ExplorerItemResponseDTO toResponseDTO(ExplorerItemDTO item) {
        if (item == null) return null;

        return ExplorerItemResponseDTO.builder()
            .name(item.getName())
            .relativePath(item.getRelativePath())
            .isFolder(item.getIsFolder())
            .byteSize(item.getByteSize())
            .lastModified(item.getLastModified())
            .isAccessible(item.getIsAccessible())
            .warningSignal(item.getWarningSignal())
            .warningMessage(item.getWarningMessage())
            .build();
    }
}
