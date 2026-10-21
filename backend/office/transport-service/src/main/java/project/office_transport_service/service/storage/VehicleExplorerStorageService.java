package project.office_transport_service.service.storage;

import project.office_transport_service.model.dto.object.ExplorerItemDTO;

import java.io.InputStream;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VehicleExplorerStorageService {
    List<ExplorerItemDTO> listDirectory(UUID vehicleUid, String relativeFolder);
    ExplorerItemDTO createFolder(UUID vehicleUid, String parentFolder, String folderName);
    ExplorerItemDTO saveFile(UUID vehicleUid, String destinationFolder, String fileName, InputStream stream, long byteSize);
    boolean deleteItem(UUID vehicleUid, String relativePath);
    ExplorerItemDTO moveOrRename(UUID vehicleUid, String sourcePath, String targetPath);
    Optional<InputStream> readFile(UUID vehicleUid, String relativePath);
    void initializeVehicleDirectory(UUID vehicleUid);
}
