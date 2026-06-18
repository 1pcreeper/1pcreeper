package project.office_expenditure_service.model.dto.object;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Null;
import lombok.Builder;
import lombok.Data;
import project.office_expenditure_service.model.entity.enums.UserRole;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
public class UserDTO {
    @Null
    private Long id;
    private String uid;
    private String name;
    private String email;
    private String displayName;
    @NotNull
    private Set<UserRole> roles;
    @Null
    private LocalDateTime createdAt;
    @Null
    private LocalDateTime updatedAt;
}
