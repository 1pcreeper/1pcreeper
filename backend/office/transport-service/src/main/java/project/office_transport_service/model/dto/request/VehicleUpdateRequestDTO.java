package project.office_transport_service.model.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.office_transport_service.model.entity.enums.FuelType;
import project.office_transport_service.model.entity.enums.VehicleClass;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleUpdateRequestDTO {

    private UUID personUid;

    @Size(max = 32, message = "License plate must not exceed 32 characters")
    private String licensePlate;

    @Size(max = 100, message = "Make must not exceed 100 characters")
    private String make;

    @Size(max = 100, message = "Model must not exceed 100 characters")
    private String model;

    @Min(value = 1900, message = "Year of manufacture must be after 1900")
    @Max(value = 2100, message = "Year of manufacture must be before 2100")
    private Integer yearOfManufacture;

    @Size(max = 50, message = "Color must not exceed 50 characters")
    private String color;

    @Size(max = 100, message = "Chassis number must not exceed 100 characters")
    private String chassisNumber;

    @Size(max = 100, message = "Engine number must not exceed 100 characters")
    private String engineNumber;

    @Min(value = 1, message = "Engine capacity must be greater than 0")
    private Integer engineCapacityCc;

    @Min(value = 1, message = "Seating capacity must be greater than 0")
    private Integer seatingCapacity;

    private FuelType fuelType;

    private VehicleClass vehicleClass;

    private LocalDate vrdExpiryDate;

    private String avatarUrl;

    private Boolean isActive;

    // Optional 1-to-1 detail
    private String insurancePolicyNumber;
    private String insuranceCompany;
    private LocalDate insuranceExpiryDate;
    private LocalDate firstRegistrationDate;
    private String notes;
}
