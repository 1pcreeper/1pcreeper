package project.office_transport_service.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.office_transport_service.model.entity.enums.FuelType;
import project.office_transport_service.model.entity.enums.VehicleClass;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleResponseDTO {
    private Long id;
    private UUID uid;
    private UUID personUid;
    private String licensePlate;
    private String make;
    private String model;
    private Integer yearOfManufacture;
    private String color;
    private String chassisNumber;
    private String engineNumber;
    private Integer engineCapacityCc;
    private Integer seatingCapacity;
    private FuelType fuelType;
    private VehicleClass vehicleClass;
    private LocalDate vrdExpiryDate;
    private String avatarUrl;
    private Boolean isActive;

    // Enriched owner metadata resolved across microservice boundary via gRPC
    private String ownerName;
    private String ownerMobile;
    private String ownerEmail;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
