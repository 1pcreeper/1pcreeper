package project.office_transport_service.model.dto.object;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.office_transport_service.model.entity.enums.VrdSubmissionStatus;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VrdSubmissionDTO {
    private Long id;
    private UUID uid;
    private Long vehicleId;
    private String fileKey;
    private String sha256;
    private Long byteSize;
    private String mediaType;
    private Map<String, Object> ocrRawData;
    private VrdSubmissionStatus status;
    private Long reviewedByUserId;
    private LocalDateTime reviewedAt;
    private String declineReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
