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
public class CompanyUpdateRequestDTO {

    @Size(max = 255, message = "English name must not exceed 255 characters")
    private String nameEnglish;

    @Size(max = 255, message = "Chinese name must not exceed 255 characters")
    private String nameChinese;

    @Size(max = 50)
    @Pattern(regexp = "^[0-9]{8}$", message = "Business Registration Number must be exactly 8 digits")
    private String businessRegistrationNumber;

    @Size(max = 20)
    @Pattern(regexp = "^[0-9]{6}$", message = "Secretary License Number must be exactly 6 digits")
    private String secretaryLicenseNumber;

    @Size(max = 255)
    @Pattern(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9._%+-]+\\.[a-zA-Z]{2,}$", message = "Invalid email format")
    private String email;

    @Size(max = 50)
    @Pattern(regexp = "^[+]([0-9]){3}\\s([0-9])+$", message = "Invalid telephone format")
    private String tel;

    private Boolean isActive;

    // Allows updating details in the same payload
    private CompanyDetailRequestDTO details;
}