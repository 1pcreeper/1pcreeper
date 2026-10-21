package project.office_transport_service.model.dto.request;

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
public class VehicleVrdUpdateRequestDTO {

    @Size(max = 100, message = "Document number must not exceed 100 characters")
    private String documentNumber;

    @Size(max = 50, message = "Registration mark must not exceed 50 characters")
    private String registrationMark;

    @Size(max = 255, message = "Registered owner name must not exceed 255 characters")
    private String registeredOwnerName;

    private String registeredOwnerAddress;

    private LocalDate issueDate;

    private LocalDate expiryDate;

    private VrdStatus status;
}
