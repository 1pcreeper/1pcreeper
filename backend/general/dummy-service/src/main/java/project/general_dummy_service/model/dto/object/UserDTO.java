package project.general_dummy_service.model.dto.object;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Null;
import lombok.Builder;
import lombok.Data;
import project.general_dummy_service.model.entity.enums.UserRole;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
public class UserDTO {
    @Null
    private Long id;
    private String uid;
    @NotNull
    private Set<UserRole> roles;
    @Null
    private LocalDateTime createdAt;
    @Null
    private LocalDateTime updatedAt;
}
