package project.office_workforce_service.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PersonCreateRequestDTO {

    @NotBlank(message = "English name cannot be blank")
    @Size(max = 255, message = "English name must not exceed 255 characters")
    private String nameEnglish;

    @Size(max = 255, message = "Chinese name must not exceed 255 characters")
    private String nameChinese;

    @Size(max = 50)
    @Pattern(regexp = "^[+]([0-9]){3}\\s([0-9])+$", message = "Invalid office telephone format. Example: +852 12345678")
    private String officeTel;

    @Size(max = 50)
    @Pattern(regexp = "^[+]([0-9]){3}\\s([0-9])+$", message = "Invalid mobile telephone format. Example: +852 91234567")
    private String mobileTel;

    @NotBlank(message = "Email is required")
    @Size(max = 255)
    @Pattern(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9._%+-]+\\.[a-zA-Z]{2,}$", message = "Invalid email format or contains spaces")
    private String email;

    @Size(max = 255)
    @Pattern(regexp = "^[A-Z][0-9]{6}\\([0-9]\\)$", message = "Invalid HK ID format. Example: A123456(1)")
    private String hkId;

    @Size(max = 255)
    @Pattern(regexp = "^[1-9]\\d{5}(18|19|20)\\d{2}((0[1-9])|10|11|12)((0[1-9]|[12]\\d|3[01]))\\d{3}[\\dXx]$", message = "Invalid CN ID format")
    private String cnId;

    @Size(max = 255)
    @Pattern(regexp = "^\\d{8}$", message = "Invalid MO ID format. Must be exactly 8 digits.")
    private String moId;

    @Size(max = 255)
    @Pattern(regexp = "^[A-Z0-9]+$", message = "Invalid Passport ID format. Alphanumeric only.")
    private String passportId;
}