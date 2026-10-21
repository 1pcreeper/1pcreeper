package project.office_transport_service.model.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.office_transport_service.model.entity.enums.VrdSubmissionStatus;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VrdSubmissionUpdateRequestDTO {
    private VrdSubmissionStatus status;
    private String declineReason;
    private Map<String, Object> ocrRawData;
}
