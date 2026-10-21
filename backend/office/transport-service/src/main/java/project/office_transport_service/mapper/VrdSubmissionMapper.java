package project.office_transport_service.mapper;

import org.springframework.stereotype.Component;
import project.office_transport_service.model.dto.object.VrdSubmissionDTO;
import project.office_transport_service.model.dto.request.VrdSubmissionUpdateRequestDTO;
import project.office_transport_service.model.dto.response.VrdSubmissionResponseDTO;
import project.office_transport_service.model.entity.User;
import project.office_transport_service.model.entity.Vehicle;
import project.office_transport_service.model.entity.VrdSubmission;
import project.office_transport_service.model.entity.enums.VrdSubmissionStatus;

import java.util.Map;
import java.util.UUID;

@Component
public class VrdSubmissionMapper {

    private String emptyToNull(String value) {
        if (value == null) return null;
        value = value.trim();
        return value.isEmpty() ? null : value;
    }

    public VrdSubmission toEntity(Vehicle vehicle, String fileKey, String sha256,
                                  Long byteSize, String mediaType, Map<String, Object> ocrRawData) {
        return VrdSubmission.builder()
            .uid(UUID.randomUUID())
            .vehicle(vehicle)
            .fileKey(fileKey)
            .sha256(sha256)
            .byteSize(byteSize)
            .mediaType(mediaType)
            .ocrRawData(ocrRawData)
            .status(VrdSubmissionStatus.PENDING)
            .build();
    }

    public void updateEntity(VrdSubmissionUpdateRequestDTO request, VrdSubmission entity, User reviewer) {
        if (request == null || entity == null) return;

        if (request.getStatus() != null) {
            entity.setStatus(request.getStatus());
        }
        if (request.getDeclineReason() != null) {
            entity.setDeclineReason(emptyToNull(request.getDeclineReason()));
        }
        if (request.getOcrRawData() != null) {
            entity.setOcrRawData(request.getOcrRawData());
        }
        if (reviewer != null) {
            entity.setReviewedBy(reviewer);
            entity.setReviewedAt(java.time.LocalDateTime.now());
        }
    }

    public VrdSubmissionResponseDTO toResponseDTO(VrdSubmission entity) {
        if (entity == null) return null;

        return VrdSubmissionResponseDTO.builder()
            .id(entity.getId())
            .uid(entity.getUid())
            .vehicleId(entity.getVehicle() != null ? entity.getVehicle().getId() : null)
            .fileKey(entity.getFileKey())
            .sha256(entity.getSha256())
            .byteSize(entity.getByteSize())
            .mediaType(entity.getMediaType())
            .ocrRawData(entity.getOcrRawData())
            .status(entity.getStatus())
            .reviewedByUserId(entity.getReviewedBy() != null ? entity.getReviewedBy().getId() : null)
            .reviewedAt(entity.getReviewedAt())
            .declineReason(entity.getDeclineReason())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }

    public VrdSubmissionDTO toDTO(VrdSubmission entity) {
        if (entity == null) return null;

        return VrdSubmissionDTO.builder()
            .id(entity.getId())
            .uid(entity.getUid())
            .vehicleId(entity.getVehicle() != null ? entity.getVehicle().getId() : null)
            .fileKey(entity.getFileKey())
            .sha256(entity.getSha256())
            .byteSize(entity.getByteSize())
            .mediaType(entity.getMediaType())
            .ocrRawData(entity.getOcrRawData())
            .status(entity.getStatus())
            .reviewedByUserId(entity.getReviewedBy() != null ? entity.getReviewedBy().getId() : null)
            .reviewedAt(entity.getReviewedAt())
            .declineReason(entity.getDeclineReason())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }
}
