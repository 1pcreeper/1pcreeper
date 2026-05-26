package project.office_account_service.model.dto.object;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Null;
import lombok.Builder;
import lombok.Data;
import project.office_account_service.model.entity.enums.OfficeUserRole;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
public class OfficeUserDTO {
    @Null
    private Long id;
    private String uid;
    private String name;
    private String email;
    private String displayName;
    @NotNull
    private Set<OfficeUserRole> roles;
    @Null
    private LocalDateTime createdAt;
    @Null
    private LocalDateTime updatedAt;
}
