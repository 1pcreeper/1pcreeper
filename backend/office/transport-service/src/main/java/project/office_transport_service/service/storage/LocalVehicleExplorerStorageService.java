package project.office_transport_service.service.storage;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import project.office_transport_service.model.dto.object.ExplorerItemDTO;
import project.shared_office_starter.model.exception.PropertyValidationException;

import java.io.*;
import java.nio.file.*;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
public class LocalVehicleExplorerStorageService implements VehicleExplorerStorageService {

    private final Path rootStoragePath;

    public LocalVehicleExplorerStorageService(
        @Value("${storage.local.root-path:${OFFICE_TRANSPORT_SERVICE_STORAGE_ROOT_PATH:/data/local/office/transport-service}}")
        String rootPathString
    ) {
        this.rootStoragePath = Paths.get(rootPathString).toAbsolutePath().normalize();
    }

    private Path getVehicleExplorerRoot(UUID vehicleUid) {
        if (vehicleUid == null) {
            throw new PropertyValidationException("Vehicle UID cannot be null");
        }
        Path explorerRoot = rootStoragePath.resolve("vehicles")
            .resolve(vehicleUid.toString())
            .resolve("explorer")
            .normalize();

        try {
            if (!Files.exists(explorerRoot)) {
                Files.createDirectories(explorerRoot);
            }
        } catch (IOException e) {
            log.error("Failed to initialize explorer root for vehicle {}: {}", vehicleUid, e.getMessage());
        }

        return explorerRoot;
    }

    private Path resolveExplorerPath(UUID vehicleUid, String relativePath) {
        Path explorerRoot = getVehicleExplorerRoot(vehicleUid);
        if (relativePath == null || relativePath.isBlank() || relativePath.equals("/") || relativePath.equals(".")) {
            return explorerRoot;
        }

        if (relativePath.contains("..") || relativePath.contains("\0")) {
            throw new PropertyValidationException("Directory traversal path attempt detected: " + relativePath);
        }

        String clean = relativePath.startsWith("/") ? relativePath.substring(1) : relativePath;
        Path resolved = explorerRoot.resolve(clean).normalize();

        if (!resolved.startsWith(explorerRoot)) {
            throw new PropertyValidationException("Target path is outside vehicle explorer sandbox: " + relativePath);
        }

        return resolved;
    }

    @Override
    public void initializeVehicleDirectory(UUID vehicleUid) {
        Path explorerRoot = getVehicleExplorerRoot(vehicleUid);
        try {
            Files.createDirectories(explorerRoot.resolve("General"));
            Files.createDirectories(explorerRoot.resolve("Maintenance"));
            Files.createDirectories(explorerRoot.resolve("Photos"));
            log.info("Initialized default explorer folders for vehicle {}", vehicleUid);
        } catch (IOException e) {
            log.warn("Warning initializing default folders for vehicle {}: {}", vehicleUid, e.getMessage());
        }
    }

    @Override
    public List<ExplorerItemDTO> listDirectory(UUID vehicleUid, String relativeFolder) {
        Path targetDir = resolveExplorerPath(vehicleUid, relativeFolder);
        Path explorerRoot = getVehicleExplorerRoot(vehicleUid);
        List<ExplorerItemDTO> items = new ArrayList<>();

        if (!Files.exists(targetDir)) {
            log.warn("Explorer directory not found on disk: vehicle={}, path={}", vehicleUid, relativeFolder);
            items.add(ExplorerItemDTO.builder()
                .name(targetDir.getFileName() != null ? targetDir.getFileName().toString() : relativeFolder)
                .relativePath(relativeFolder)
                .isFolder(true)
                .isAccessible(false)
                .warningSignal("FOLDER_NOT_FOUND")
                .warningMessage("Requested folder does not exist or was renamed on disk")
                .build());
            return items;
        }

        try (DirectoryStream<Path> stream = Files.newDirectoryStream(targetDir)) {
            for (Path entry : stream) {
                try {
                    String relative = explorerRoot.relativize(entry).toString().replace('\\', '/');
                    boolean isDirectory = Files.isDirectory(entry);
                    long size = isDirectory ? 0L : Files.size(entry);
                    Instant modifiedInstant = Files.getLastModifiedTime(entry).toInstant();
                    LocalDateTime lastModified = LocalDateTime.ofInstant(modifiedInstant, ZoneId.systemDefault());

                    items.add(ExplorerItemDTO.builder()
                        .name(entry.getFileName().toString())
                        .relativePath(relative)
                        .isFolder(isDirectory)
                        .byteSize(size)
                        .lastModified(lastModified)
                        .isAccessible(true)
                        .build());
                } catch (NoSuchFileException | FileNotFoundException e) {
                    log.warn("Entry disappeared while listing directory: {}", entry);
                    items.add(ExplorerItemDTO.builder()
                        .name(entry.getFileName().toString())
                        .relativePath(explorerRoot.relativize(entry).toString().replace('\\', '/'))
                        .isAccessible(false)
                        .warningSignal("FILE_OR_FOLDER_INACCESSIBLE")
                        .warningMessage("Target file or folder has disappeared or was renamed on disk")
                        .build());
                } catch (IOException e) {
                    log.warn("Error reading entry attributes for {}: {}", entry, e.getMessage());
                    items.add(ExplorerItemDTO.builder()
                        .name(entry.getFileName().toString())
                        .relativePath(explorerRoot.relativize(entry).toString().replace('\\', '/'))
                        .isAccessible(false)
                        .warningSignal("FILE_ATTRIBUTES_UNREADABLE")
                        .warningMessage("Could not read file attributes: " + e.getMessage())
                        .build());
                }
            }
        } catch (IOException e) {
            log.error("Failed to list explorer directory at {}: {}", targetDir, e.getMessage());
            items.add(ExplorerItemDTO.builder()
                .name(targetDir.getFileName().toString())
                .relativePath(relativeFolder)
                .isFolder(true)
                .isAccessible(false)
                .warningSignal("DIRECTORY_ACCESS_DENIED")
                .warningMessage("Error reading directory stream: " + e.getMessage())
                .build());
        }

        // Sort folders first, then alphabetically
        items.sort(Comparator.comparing(ExplorerItemDTO::getIsFolder, Comparator.reverseOrder())
            .thenComparing(ExplorerItemDTO::getName, String.CASE_INSENSITIVE_ORDER));

        return items;
    }

    @Override
    public ExplorerItemDTO createFolder(UUID vehicleUid, String parentFolder, String folderName) {
        if (folderName == null || folderName.isBlank()) {
            throw new PropertyValidationException("Folder name cannot be empty");
        }
        if (folderName.contains("/") || folderName.contains("\\") || folderName.contains("..")) {
            throw new PropertyValidationException("Invalid characters in folder name: " + folderName);
        }

        Path parentPath = resolveExplorerPath(vehicleUid, parentFolder);
        Path newFolderPath = parentPath.resolve(folderName).normalize();
        Path explorerRoot = getVehicleExplorerRoot(vehicleUid);

        try {
            Files.createDirectories(newFolderPath);
            String relative = explorerRoot.relativize(newFolderPath).toString().replace('\\', '/');
            return ExplorerItemDTO.builder()
                .name(folderName)
                .relativePath(relative)
                .isFolder(true)
                .byteSize(0L)
                .lastModified(LocalDateTime.now())
                .isAccessible(true)
                .build();
        } catch (IOException e) {
            log.error("Failed to create folder {} on disk: {}", newFolderPath, e.getMessage());
            return ExplorerItemDTO.builder()
                .name(folderName)
                .relativePath(explorerRoot.relativize(newFolderPath).toString().replace('\\', '/'))
                .isFolder(true)
                .isAccessible(false)
                .warningSignal("FOLDER_CREATION_FAILED")
                .warningMessage("Failed to create folder on disk: " + e.getMessage())
                .build();
        }
    }

    @Override
    public ExplorerItemDTO saveFile(UUID vehicleUid, String destinationFolder, String fileName, InputStream stream, long byteSize) {
        if (fileName == null || fileName.isBlank()) {
            throw new PropertyValidationException("File name cannot be empty");
        }
        if (fileName.contains("/") || fileName.contains("\\") || fileName.contains("..")) {
            throw new PropertyValidationException("Invalid characters in file name: " + fileName);
        }

        Path destDirPath = resolveExplorerPath(vehicleUid, destinationFolder);
        Path filePath = destDirPath.resolve(fileName).normalize();
        Path explorerRoot = getVehicleExplorerRoot(vehicleUid);

        try {
            if (!Files.exists(destDirPath)) {
                Files.createDirectories(destDirPath);
            }

            long written;
            try (OutputStream os = Files.newOutputStream(filePath, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING)) {
                written = stream.transferTo(os);
            }

            String relative = explorerRoot.relativize(filePath).toString().replace('\\', '/');
            return ExplorerItemDTO.builder()
                .name(fileName)
                .relativePath(relative)
                .isFolder(false)
                .byteSize(written)
                .lastModified(LocalDateTime.now())
                .isAccessible(true)
                .build();
        } catch (IOException e) {
            log.error("Failed to save file {} on disk: {}", filePath, e.getMessage());
            return ExplorerItemDTO.builder()
                .name(fileName)
                .relativePath(explorerRoot.relativize(filePath).toString().replace('\\', '/'))
                .isFolder(false)
                .byteSize(0L)
                .isAccessible(false)
                .warningSignal("FILE_SAVE_FAILED")
                .warningMessage("Failed to write file to disk: " + e.getMessage())
                .build();
        }
    }

    @Override
    public boolean deleteItem(UUID vehicleUid, String relativePath) {
        Path targetPath = resolveExplorerPath(vehicleUid, relativePath);
        Path explorerRoot = getVehicleExplorerRoot(vehicleUid);

        // Disallow deleting the root explorer folder itself
        if (targetPath.equals(explorerRoot)) {
            throw new PropertyValidationException("Cannot delete the root explorer directory");
        }

        try {
            if (Files.isDirectory(targetPath)) {
                // Recursively delete folder contents
                try (var walk = Files.walk(targetPath)) {
                    walk.sorted(Comparator.reverseOrder())
                        .forEach(p -> {
                            try {
                                Files.deleteIfExists(p);
                            } catch (IOException ex) {
                                log.warn("Failed to delete sub-path: {}", p, ex);
                            }
                        });
                }
                return true;
            } else {
                return Files.deleteIfExists(targetPath);
            }
        } catch (IOException e) {
            log.error("Failed to delete item at {}: {}", targetPath, e.getMessage());
            return false;
        }
    }

    @Override
    public ExplorerItemDTO moveOrRename(UUID vehicleUid, String sourcePath, String targetPath) {
        Path src = resolveExplorerPath(vehicleUid, sourcePath);
        Path dst = resolveExplorerPath(vehicleUid, targetPath);
        Path explorerRoot = getVehicleExplorerRoot(vehicleUid);

        if (!Files.exists(src)) {
            return ExplorerItemDTO.builder()
                .name(src.getFileName().toString())
                .relativePath(sourcePath)
                .isAccessible(false)
                .warningSignal("SOURCE_NOT_FOUND")
                .warningMessage("Source file or folder does not exist on disk")
                .build();
        }

        try {
            if (dst.getParent() != null && !Files.exists(dst.getParent())) {
                Files.createDirectories(dst.getParent());
            }

            Files.move(src, dst, StandardCopyOption.REPLACE_EXISTING);

            boolean isDirectory = Files.isDirectory(dst);
            long size = isDirectory ? 0L : Files.size(dst);
            String relative = explorerRoot.relativize(dst).toString().replace('\\', '/');

            return ExplorerItemDTO.builder()
                .name(dst.getFileName().toString())
                .relativePath(relative)
                .isFolder(isDirectory)
                .byteSize(size)
                .lastModified(LocalDateTime.now())
                .isAccessible(true)
                .build();
        } catch (IOException e) {
            log.error("Failed to move/rename from {} to {}: {}", src, dst, e.getMessage());
            return ExplorerItemDTO.builder()
                .name(src.getFileName().toString())
                .relativePath(sourcePath)
                .isAccessible(false)
                .warningSignal("MOVE_RENAME_FAILED")
                .warningMessage("Failed to move or rename file on disk: " + e.getMessage())
                .build();
        }
    }

    @Override
    public Optional<InputStream> readFile(UUID vehicleUid, String relativePath) {
        Path targetPath = resolveExplorerPath(vehicleUid, relativePath);
        if (!Files.exists(targetPath) || Files.isDirectory(targetPath)) {
            return Optional.empty();
        }
        try {
            return Optional.of(Files.newInputStream(targetPath));
        } catch (IOException e) {
            log.error("Error reading explorer file at {}: {}", targetPath, e.getMessage());
            return Optional.empty();
        }
    }
}
