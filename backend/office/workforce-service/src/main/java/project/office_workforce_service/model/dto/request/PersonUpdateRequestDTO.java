package project.office_workforce_service.model.dto.request;

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
public class PersonUpdateRequestDTO {

    @Size(max = 255, message = "English name must not exceed 255 characters")
    private String nameEnglish;

    @Size(max = 255, message = "Chinese name must not exceed 255 characters")
    private String nameChinese;

    @Size(max = 50)
    @Pattern(regexp = "^[+]([0-9]){3}\\s([0-9])+$", message = "Invalid office telephone format")
    private String officeTel;

    @Size(max = 50)
    @Pattern(regexp = "^[+]([0-9]){3}\\s([0-9])+$", message = "Invalid mobile telephone format")
    private String mobileTel;

    @Size(max = 255)
    @Pattern(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9._%+-]+\\.[a-zA-Z]{2,}$", message = "Invalid email format or contains spaces")
    private String email;
}