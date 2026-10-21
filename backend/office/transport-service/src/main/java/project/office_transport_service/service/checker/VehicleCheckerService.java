package project.office_transport_service.service.checker;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import project.office_transport_service.model.dto.request.VehicleCreateRequestDTO;
import project.office_transport_service.model.dto.request.VehicleUpdateRequestDTO;
import project.office_transport_service.model.entity.Vehicle;
import project.office_transport_service.service.client.WorkforceDirectoryClient;
import project.office_transport_service.service.manager.VehicleManagerService;
import project.shared_office_starter.model.exception.PropertyValidationException;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

import java.util.UUID;

@Service
public class VehicleCheckerService {

    private final VehicleManagerService vehicleManagerService;
    private final WorkforceDirectoryClient workforceDirectoryClient;

    @Autowired
    public VehicleCheckerService(
        VehicleManagerService vehicleManagerService,
        WorkforceDirectoryClient workforceDirectoryClient
    ) {
        this.vehicleManagerService = vehicleManagerService;
        this.workforceDirectoryClient = workforceDirectoryClient;
    }

    public void checkVehicleIsActive(Vehicle vehicle) {
        if (vehicle == null || Boolean.FALSE.equals(vehicle.getIsActive())) {
            throw new ResourceNotFoundException("Vehicle not found or has been deactivated.");
        }
    }

    public void checkCreateRequest(VehicleCreateRequestDTO dto) {
        if (dto == null) {
            throw new PropertyValidationException("Vehicle creation payload cannot be null.");
        }

        if (dto.getLicensePlate() == null || dto.getLicensePlate().isBlank()) {
            throw new PropertyValidationException("License plate cannot be blank.");
        }

        String plate = dto.getLicensePlate().trim();
        if (vehicleManagerService.existsByLicensePlate(plate, null)) {
            throw new PropertyValidationException("Active vehicle with license plate " + plate + " already exists.");
        }

        if (dto.getPersonUid() != null) {
            checkOwnerPersonExistsAndActive(dto.getPersonUid());
        }

        if (dto.getYearOfManufacture() != null && (dto.getYearOfManufacture() < 1900 || dto.getYearOfManufacture() > 2100)) {
            throw new PropertyValidationException("Year of manufacture must be between 1900 and 2100.");
        }
    }

    public void checkUpdateRequest(Long currentId, VehicleUpdateRequestDTO dto) {
        if (dto == null) {
            throw new PropertyValidationException("Vehicle update payload cannot be null.");
        }

        if (dto.getLicensePlate() != null && !dto.getLicensePlate().isBlank()) {
            String plate = dto.getLicensePlate().trim();
            if (vehicleManagerService.existsByLicensePlate(plate, currentId)) {
                throw new PropertyValidationException("Another active vehicle with license plate " + plate + " already exists.");
            }
        }

        if (dto.getPersonUid() != null) {
            checkOwnerPersonExistsAndActive(dto.getPersonUid());
        }

        if (dto.getYearOfManufacture() != null && (dto.getYearOfManufacture() < 1900 || dto.getYearOfManufacture() > 2100)) {
            throw new PropertyValidationException("Year of manufacture must be between 1900 and 2100.");
        }
    }

    public void checkOwnerPersonExistsAndActive(UUID personUid) {
        if (personUid == null) return;
        boolean isActive = workforceDirectoryClient.isPersonActive(personUid);
        if (!isActive) {
            throw new PropertyValidationException("Owner person with UID " + personUid + " was not found or is currently inactive in workforce directory.");
        }
    }
}
