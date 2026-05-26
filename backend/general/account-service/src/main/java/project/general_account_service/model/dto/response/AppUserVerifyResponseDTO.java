package project.general_account_service.model.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
public class AppUserVerifyResponseDTO {
    private Long id;
    private String uid;
    private String name;
    private String email;
    private String displayName;
    private Set<String> roles;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
