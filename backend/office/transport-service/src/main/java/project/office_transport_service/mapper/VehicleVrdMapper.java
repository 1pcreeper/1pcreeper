package project.office_transport_service.mapper;

import org.springframework.stereotype.Component;
import project.office_transport_service.model.dto.object.VehicleVrdDTO;
import project.office_transport_service.model.dto.request.VehicleVrdCreateRequestDTO;
import project.office_transport_service.model.dto.request.VehicleVrdUpdateRequestDTO;
import project.office_transport_service.model.dto.response.VehicleVrdResponseDTO;
import project.office_transport_service.model.entity.Vehicle;
import project.office_transport_service.model.entity.VehicleVrd;

import java.util.UUID;

@Component
public class VehicleVrdMapper {

    private String emptyToNull(String value) {
        if (value == null) return null;
        value = value.trim();
        return value.isEmpty() ? null : value;
    }

    public VehicleVrd toEntity(VehicleVrdCreateRequestDTO request, Vehicle vehicle) {
        if (request == null) return null;

        return VehicleVrd.builder()
            .uid(UUID.randomUUID())
            .vehicle(vehicle)
            .documentNumber(emptyToNull(request.getDocumentNumber()))
            .registrationMark(emptyToNull(request.getRegistrationMark()))
            .registeredOwnerName(emptyToNull(request.getRegisteredOwnerName()))
            .registeredOwnerAddress(emptyToNull(request.getRegisteredOwnerAddress()))
            .issueDate(request.getIssueDate())
            .expiryDate(request.getExpiryDate())
            .fileKey(emptyToNull(request.getFileKey()))
            .sha256(emptyToNull(request.getSha256()))
            .byteSize(request.getByteSize())
            .mediaType(emptyToNull(request.getMediaType()))
            .status(request.getStatus())
            .build();
    }

    public void updateEntity(VehicleVrdUpdateRequestDTO request, VehicleVrd entity) {
        if (request == null || entity == null) return;

        if (request.getDocumentNumber() != null) {
            entity.setDocumentNumber(emptyToNull(request.getDocumentNumber()));
        }
        if (request.getRegistrationMark() != null) {
            entity.setRegistrationMark(emptyToNull(request.getRegistrationMark()));
        }
        if (request.getRegisteredOwnerName() != null) {
            entity.setRegisteredOwnerName(emptyToNull(request.getRegisteredOwnerName()));
        }
        if (request.getRegisteredOwnerAddress() != null) {
            entity.setRegisteredOwnerAddress(emptyToNull(request.getRegisteredOwnerAddress()));
        }
        if (request.getIssueDate() != null) {
            entity.setIssueDate(request.getIssueDate());
        }
        if (request.getExpiryDate() != null) {
            entity.setExpiryDate(request.getExpiryDate());
        }
        if (request.getStatus() != null) {
            entity.setStatus(request.getStatus());
        }
    }

    public VehicleVrdResponseDTO toResponseDTO(VehicleVrd entity) {
        if (entity == null) return null;

        return VehicleVrdResponseDTO.builder()
            .id(entity.getId())
            .uid(entity.getUid())
            .vehicleId(entity.getVehicle() != null ? entity.getVehicle().getId() : null)
            .documentNumber(entity.getDocumentNumber())
            .registrationMark(entity.getRegistrationMark())
            .registeredOwnerName(entity.getRegisteredOwnerName())
            .registeredOwnerAddress(entity.getRegisteredOwnerAddress())
            .issueDate(entity.getIssueDate())
            .expiryDate(entity.getExpiryDate())
            .fileKey(entity.getFileKey())
            .sha256(entity.getSha256())
            .byteSize(entity.getByteSize())
            .mediaType(entity.getMediaType())
            .status(entity.getStatus())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }

    public VehicleVrdDTO toDTO(VehicleVrd entity) {
        if (entity == null) return null;

        return VehicleVrdDTO.builder()
            .id(entity.getId())
            .uid(entity.getUid())
            .vehicleId(entity.getVehicle() != null ? entity.getVehicle().getId() : null)
            .documentNumber(entity.getDocumentNumber())
            .registrationMark(entity.getRegistrationMark())
            .registeredOwnerName(entity.getRegisteredOwnerName())
            .registeredOwnerAddress(entity.getRegisteredOwnerAddress())
            .issueDate(entity.getIssueDate())
            .expiryDate(entity.getExpiryDate())
            .fileKey(entity.getFileKey())
            .sha256(entity.getSha256())
            .byteSize(entity.getByteSize())
            .mediaType(entity.getMediaType())
            .status(entity.getStatus())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }
}
