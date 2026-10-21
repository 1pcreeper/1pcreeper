package project.office_transport_service.service.storage;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import project.office_transport_service.model.dto.storage.StoredDocumentDTO;
import project.shared_office_starter.model.exception.PropertyValidationException;

import java.io.*;
import java.nio.file.*;
import java.security.DigestInputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HexFormat;
import java.util.Optional;

@Slf4j
@Service
public class LocalFileDocumentStorageService implements DocumentStorageService {

    private final Path rootStoragePath;

    public LocalFileDocumentStorageService(
        @Value("${storage.local.root-path:${OFFICE_TRANSPORT_SERVICE_STORAGE_ROOT_PATH:/data/local/office/transport-service}}")
        String rootPathString
    ) {
        this.rootStoragePath = Paths.get(rootPathString).toAbsolutePath().normalize();
        initStorageDirectory();
    }

    private void initStorageDirectory() {
        try {
            if (!Files.exists(rootStoragePath)) {
                Files.createDirectories(rootStoragePath);
                log.info("Initialized storage root directory: {}", rootStoragePath);
            }
            Files.createDirectories(rootStoragePath.resolve("vehicles"));
            Files.createDirectories(rootStoragePath.resolve("staging"));
        } catch (IOException e) {
            log.error("Failed to initialize storage root directories at {}: {}", rootStoragePath, e.getMessage());
        }
    }

    private Path resolveSafely(String relativeKey) {
        if (relativeKey == null || relativeKey.isBlank()) {
            throw new PropertyValidationException("Relative key cannot be empty");
        }
        if (relativeKey.contains("..") || relativeKey.contains("\0")) {
            throw new PropertyValidationException("Path traversal attempt detected in key: " + relativeKey);
        }
        String cleanPath = relativeKey.startsWith("/") ? relativeKey.substring(1) : relativeKey;
        Path resolved = rootStoragePath.resolve(cleanPath).normalize();
        if (!resolved.startsWith(rootStoragePath)) {
            throw new PropertyValidationException("Path lies outside storage root directory: " + relativeKey);
        }
        return resolved;
    }

    @Override
    public StoredDocumentDTO put(String relativeKey, InputStream content, String mediaType, long contentLength) {
        Path targetPath = resolveSafely(relativeKey);
        try {
            if (targetPath.getParent() != null && !Files.exists(targetPath.getParent())) {
                Files.createDirectories(targetPath.getParent());
            }

            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            long bytesWritten;
            try (DigestInputStream dis = new DigestInputStream(content, digest);
                 OutputStream os = Files.newOutputStream(targetPath, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING)) {
                bytesWritten = dis.transferTo(os);
            }

            String sha256Hex = HexFormat.of().formatHex(digest.digest());

            return StoredDocumentDTO.builder()
                .relativeKey(relativeKey)
                .mediaType(mediaType != null ? mediaType : "application/octet-stream")
                .byteSize(bytesWritten)
                .sha256(sha256Hex)
                .isAccessible(true)
                .lastModified(LocalDateTime.now())
                .build();
        } catch (NoSuchAlgorithmException e) {
            log.error("SHA-256 algorithm not available: {}", e.getMessage());
            throw new IllegalStateException("SHA-256 digest algorithm not available", e);
        } catch (IOException e) {
            log.error("Error writing document to disk at {}: {}", targetPath, e.getMessage(), e);
            return StoredDocumentDTO.builder()
                .relativeKey(relativeKey)
                .isAccessible(false)
                .warningSignal("STORAGE_WRITE_FAILURE")
                .warningMessage("Failed to write document to disk: " + e.getMessage())
                .build();
        }
    }

    @Override
    public Optional<InputStream> read(String relativeKey) {
        try {
            Path targetPath = resolveSafely(relativeKey);
            if (!Files.exists(targetPath)) {
                log.warn("Storage warning: File not found on disk: {}", relativeKey);
                return Optional.empty();
            }
            return Optional.of(Files.newInputStream(targetPath));
        } catch (NoSuchFileException | FileNotFoundException e) {
            log.warn("Storage warning: File disappeared on disk: {}", relativeKey);
            return Optional.empty();
        } catch (IOException e) {
            log.error("Storage error reading {}: {}", relativeKey, e.getMessage());
            return Optional.empty();
        }
    }

    @Override
    public StoredDocumentDTO stat(String relativeKey) {
        try {
            Path targetPath = resolveSafely(relativeKey);
            if (!Files.exists(targetPath)) {
                return StoredDocumentDTO.builder()
                    .relativeKey(relativeKey)
                    .isAccessible(false)
                    .warningSignal("FILE_NOT_FOUND")
                    .warningMessage("Target document is no longer accessible on disk")
                    .build();
            }

            long byteSize = Files.size(targetPath);
            Instant modifiedInstant = Files.getLastModifiedTime(targetPath).toInstant();
            LocalDateTime lastModified = LocalDateTime.ofInstant(modifiedInstant, ZoneId.systemDefault());

            return StoredDocumentDTO.builder()
                .relativeKey(relativeKey)
                .byteSize(byteSize)
                .isAccessible(true)
                .lastModified(lastModified)
                .build();
        } catch (NoSuchFileException | FileNotFoundException e) {
            return StoredDocumentDTO.builder()
                .relativeKey(relativeKey)
                .isAccessible(false)
                .warningSignal("FILE_NOT_FOUND")
                .warningMessage("Document not found on disk: " + relativeKey)
                .build();
        } catch (IOException e) {
            return StoredDocumentDTO.builder()
                .relativeKey(relativeKey)
                .isAccessible(false)
                .warningSignal("STORAGE_IO_ERROR")
                .warningMessage("Failed to inspect file attributes: " + e.getMessage())
                .build();
        }
    }

    @Override
    public boolean delete(String relativeKey) {
        try {
            Path targetPath = resolveSafely(relativeKey);
            return Files.deleteIfExists(targetPath);
        } catch (IOException e) {
            log.error("Failed to delete document at {}: {}", relativeKey, e.getMessage());
            return false;
        }
    }
}
