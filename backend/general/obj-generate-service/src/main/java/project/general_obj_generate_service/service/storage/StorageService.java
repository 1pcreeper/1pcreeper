package project.general_obj_generate_service.service.storage;
import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    String uploadInputFile(Long projectId, MultipartFile file);
}
