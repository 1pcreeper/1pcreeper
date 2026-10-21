package project.office_transport_service.mapper;

import org.springframework.stereotype.Component;
import project.office_transport_service.model.dto.object.VehicleDTO;
import project.office_transport_service.model.dto.request.VehicleCreateRequestDTO;
import project.office_transport_service.model.dto.request.VehicleUpdateRequestDTO;
import project.office_transport_service.model.dto.response.VehicleResponseDTO;
import project.office_transport_service.model.entity.Vehicle;

import java.util.UUID;

@Component
public class VehicleMapper {

    private String emptyToNull(String value) {
        if (value == null) return null;
        value = value.trim();
        return value.isEmpty() ? null : value;
    }

    public Vehicle toEntity(VehicleCreateRequestDTO request) {
        if (request == null) return null;

        return Vehicle.builder()
            .uid(UUID.randomUUID())
            .personUid(request.getPersonUid())
            .licensePlate(emptyToNull(request.getLicensePlate()))
            .make(emptyToNull(request.getMake()))
            .model(emptyToNull(request.getModel()))
            .yearOfManufacture(request.getYearOfManufacture())
            .color(emptyToNull(request.getColor()))
            .chassisNumber(emptyToNull(request.getChassisNumber()))
            .engineNumber(emptyToNull(request.getEngineNumber()))
            .engineCapacityCc(request.getEngineCapacityCc())
            .seatingCapacity(request.getSeatingCapacity())
            .fuelType(request.getFuelType())
            .vehicleClass(request.getVehicleClass())
            .vrdExpiryDate(request.getVrdExpiryDate())
            .avatarUrl(emptyToNull(request.getAvatarUrl()))
            .isActive(true)
            .build();
    }

    public void updateEntity(VehicleUpdateRequestDTO request, Vehicle entity) {
        if (request == null || entity == null) return;

        if (request.getPersonUid() != null) entity.setPersonUid(request.getPersonUid());
        if (request.getLicensePlate() != null) entity.setLicensePlate(emptyToNull(request.getLicensePlate()));
        if (request.getMake() != null) entity.setMake(emptyToNull(request.getMake()));
        if (request.getModel() != null) entity.setModel(emptyToNull(request.getModel()));
        if (request.getYearOfManufacture() != null) entity.setYearOfManufacture(request.getYearOfManufacture());
        if (request.getColor() != null) entity.setColor(emptyToNull(request.getColor()));
        if (request.getChassisNumber() != null) entity.setChassisNumber(emptyToNull(request.getChassisNumber()));
        if (request.getEngineNumber() != null) entity.setEngineNumber(emptyToNull(request.getEngineNumber()));
        if (request.getEngineCapacityCc() != null) entity.setEngineCapacityCc(request.getEngineCapacityCc());
        if (request.getSeatingCapacity() != null) entity.setSeatingCapacity(request.getSeatingCapacity());
        if (request.getFuelType() != null) entity.setFuelType(request.getFuelType());
        if (request.getVehicleClass() != null) entity.setVehicleClass(request.getVehicleClass());
        if (request.getVrdExpiryDate() != null) entity.setVrdExpiryDate(request.getVrdExpiryDate());
        if (request.getAvatarUrl() != null) entity.setAvatarUrl(emptyToNull(request.getAvatarUrl()));
        if (request.getIsActive() != null) entity.setIsActive(request.getIsActive());
    }

    public VehicleResponseDTO toResponseDTO(Vehicle entity) {
        if (entity == null) return null;

        return VehicleResponseDTO.builder()
            .id(entity.getId())
            .uid(entity.getUid())
            .personUid(entity.getPersonUid())
            .licensePlate(entity.getLicensePlate())
            .make(entity.getMake())
            .model(entity.getModel())
            .yearOfManufacture(entity.getYearOfManufacture())
            .color(entity.getColor())
            .chassisNumber(entity.getChassisNumber())
            .engineNumber(entity.getEngineNumber())
            .engineCapacityCc(entity.getEngineCapacityCc())
            .seatingCapacity(entity.getSeatingCapacity())
            .fuelType(entity.getFuelType())
            .vehicleClass(entity.getVehicleClass())
            .vrdExpiryDate(entity.getVrdExpiryDate())
            .avatarUrl(entity.getAvatarUrl())
            .isActive(entity.getIsActive())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }

    public VehicleDTO toDTO(Vehicle entity) {
        if (entity == null) return null;

        return VehicleDTO.builder()
            .id(entity.getId())
            .uid(entity.getUid())
            .personUid(entity.getPersonUid())
            .licensePlate(entity.getLicensePlate())
            .make(entity.getMake())
            .model(entity.getModel())
            .yearOfManufacture(entity.getYearOfManufacture())
            .color(entity.getColor())
            .chassisNumber(entity.getChassisNumber())
            .engineNumber(entity.getEngineNumber())
            .engineCapacityCc(entity.getEngineCapacityCc())
            .seatingCapacity(entity.getSeatingCapacity())
            .fuelType(entity.getFuelType())
            .vehicleClass(entity.getVehicleClass())
            .vrdExpiryDate(entity.getVrdExpiryDate())
            .avatarUrl(entity.getAvatarUrl())
            .isActive(entity.getIsActive())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }
}
