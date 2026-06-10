package project.general_obj_generate_service.service.storage;

import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import project.general_obj_generate_service.properties.MinioProperties;

import java.io.InputStream;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MinioStorageService implements StorageService{

    private final MinioClient minioClient;
    private final MinioProperties minioProperties;

    /**
     * Uploads a file to MinIO and returns the structured path.
     */
    public String uploadInputFile(Long projectId, MultipartFile file) {
        // Generate a clean, collision-free file name
        String originalName = file.getOriginalFilename();
        String extension = originalName != null && originalName.contains(".")
            ? originalName.substring(originalName.lastIndexOf(".")) : ".jpg";

        String uniqueFileName = UUID.randomUUID() + extension;
        String minioPath = "inputs/projects/" + projectId + "/" + uniqueFileName;

        try (InputStream inputStream = file.getInputStream()) {
            minioClient.putObject(
                PutObjectArgs.builder()
                    .bucket(minioProperties.getBucketName())
                    .object(minioPath)
                    .stream(inputStream, file.getSize(), -1)
                    .contentType(file.getContentType())
                    .build()
            );
            log.info("📁 [MinIO] Successfully uploaded: {}", minioPath);
            return minioPath;

        } catch (Exception e) {
            log.error("❌ [MinIO] Failed to upload file: {}", minioPath, e);
            throw new RuntimeException("Could not upload file to storage", e);
        }
    }
}