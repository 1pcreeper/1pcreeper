package project.office_transport_service.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.office_transport_service.model.entity.enums.VrdStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleVrdResponseDTO {
    private Long id;
    private UUID uid;
    private Long vehicleId;
    private String documentNumber;
    private String registrationMark;
    private String registeredOwnerName;
    private String registeredOwnerAddress;
    private LocalDate issueDate;
    private LocalDate expiryDate;
    private String fileKey;
    private String sha256;
    private Long byteSize;
    private String mediaType;
    private VrdStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
