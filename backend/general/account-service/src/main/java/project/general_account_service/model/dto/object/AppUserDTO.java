package project.general_account_service.model.dto.object;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Null;
import lombok.Builder;
import lombok.Data;
import project.shared_general_common_lib.constant.AppUserRole;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
public class AppUserDTO {
    @Null
    private Long id;
    private String uid;
    private String name;
    private String email;
    private String displayName;
    @NotNull
    private Set<AppUserRole> roles;
    @Null
    private LocalDateTime createdAt;
    @Null
    private LocalDateTime updatedAt;
}
