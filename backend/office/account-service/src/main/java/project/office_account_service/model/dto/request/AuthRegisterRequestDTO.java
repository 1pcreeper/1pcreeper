package project.office_account_service.model.dto.request;

import jakarta.validation.constraints.*;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthRegisterRequestDTO {
    @Pattern(
        regexp = "^[a-zA-Z0-9._]+$",
        message = "Name must be characters"
    )
    @NotBlank
    @NotNull
    @NotEmpty(message = "Name must not be empty")
    private String name;
    @NotEmpty(message = "Display Name must not be empty")
    @NotBlank
    @NotNull
    private String displayName;
    @NotEmpty(message = "Password must not be empty")
    @NotBlank
    @NotNull
    private String password;
}
