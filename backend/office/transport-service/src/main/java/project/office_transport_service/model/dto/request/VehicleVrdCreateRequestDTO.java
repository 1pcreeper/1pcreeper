package project.office_transport_service.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.office_transport_service.model.entity.enums.VrdStatus;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleVrdCreateRequestDTO {

    @Size(max = 100, message = "Document number must not exceed 100 characters")
    private String documentNumber;

    @NotBlank(message = "Registration mark cannot be blank")
    @Size(max = 50, message = "Registration mark must not exceed 50 characters")
    private String registrationMark;

    @Size(max = 255, message = "Registered owner name must not exceed 255 characters")
    private String registeredOwnerName;

    private String registeredOwnerAddress;

    private LocalDate issueDate;

    @NotNull(message = "Expiry date cannot be null")
    private LocalDate expiryDate;

    @NotBlank(message = "File key cannot be blank")
    private String fileKey;

    @NotBlank(message = "SHA-256 cannot be blank")
    @Size(min = 64, max = 64, message = "SHA-256 hash must be 64 characters")
    private String sha256;

    @NotNull(message = "Byte size cannot be null")
    private Long byteSize;

    @NotBlank(message = "Media type cannot be blank")
    private String mediaType;

    @Builder.Default
    private VrdStatus status = VrdStatus.ACTIVE;
}
