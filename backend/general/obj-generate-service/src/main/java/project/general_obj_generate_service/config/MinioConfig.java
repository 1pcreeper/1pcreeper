package project.general_obj_generate_service.config;


import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import project.general_obj_generate_service.properties.MinioProperties;

@Slf4j
@Configuration
public class MinioConfig {

    @Autowired
    private MinioProperties minioProperties;

    @Bean
    public MinioClient minioClient() {
        MinioClient client = MinioClient.builder()
            .endpoint(minioProperties.getEndpoint())
            .credentials(minioProperties.getAccessKey(), minioProperties.getSecretKey())
            .build();

        // Auto-create the bucket if it doesn't exist yet
        try {
            boolean found = client.bucketExists(BucketExistsArgs.builder().bucket(minioProperties.getBucketName()).build());
            if (!found) {
                client.makeBucket(MakeBucketArgs.builder().bucket(minioProperties.getBucketName()).build());
                log.info("Created MinIO bucket: {}", minioProperties.getBucketName());
            }
        } catch (Exception e) {
            log.error("Failed to initialize MinIO bucket", e);
        }

        return client;
    }
}