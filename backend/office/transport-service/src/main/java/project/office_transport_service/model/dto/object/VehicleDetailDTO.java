package project.office_transport_service.model.dto.object;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleDetailDTO {
    private Long id;
    private Long vehicleId;
    private String insurancePolicyNumber;
    private String insuranceCompany;
    private LocalDate insuranceExpiryDate;
    private LocalDate firstRegistrationDate;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
