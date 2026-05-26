package project.office_account_service.model.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.Set;

@Data
@Builder
public class AuthTokenResponseDTO {
    private Long id;
    private String uid;
    private String name;
    private String email;
    private String displayName;
    private String token;
}
