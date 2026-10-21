package project.office_transport_service.service.checker;

import org.springframework.stereotype.Service;
import project.office_transport_service.model.dto.request.VehicleVrdCreateRequestDTO;
import project.office_transport_service.model.dto.request.VehicleVrdUpdateRequestDTO;
import project.office_transport_service.model.entity.VehicleVrd;
import project.shared_office_starter.model.exception.PropertyValidationException;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

@Service
public class VehicleVrdCheckerService {

    public void checkVrdExists(VehicleVrd vrd) {
        if (vrd == null) {
            throw new ResourceNotFoundException("Vehicle Registration Document (VRD) not found.");
        }
    }

    public void checkCreateRequest(VehicleVrdCreateRequestDTO dto) {
        if (dto == null) {
            throw new PropertyValidationException("VRD creation payload cannot be null.");
        }
        if (dto.getRegistrationMark() == null || dto.getRegistrationMark().isBlank()) {
            throw new PropertyValidationException("Registration mark cannot be blank.");
        }
        if (dto.getExpiryDate() == null) {
            throw new PropertyValidationException("Expiry date cannot be null.");
        }
        if (dto.getFileKey() == null || dto.getFileKey().isBlank()) {
            throw new PropertyValidationException("File key cannot be blank.");
        }
        if (dto.getSha256() == null || dto.getSha256().length() != 64) {
            throw new PropertyValidationException("SHA-256 hash must be 64 hexadecimal characters.");
        }
        if (dto.getByteSize() == null || dto.getByteSize() <= 0) {
            throw new PropertyValidationException("File byte size must be greater than zero.");
        }
    }

    public void checkUpdateRequest(VehicleVrdUpdateRequestDTO dto) {
        if (dto == null) {
            throw new PropertyValidationException("VRD update payload cannot be null.");
        }
    }
}
