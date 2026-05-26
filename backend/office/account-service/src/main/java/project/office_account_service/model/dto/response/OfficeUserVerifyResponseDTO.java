package project.office_account_service.model.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
public class OfficeUserVerifyResponseDTO {
    private Long id;
    private String uid;
    private String name;
    private String email;
    private String displayName;
    private Set<String> roles;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
