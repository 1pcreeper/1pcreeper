package project.office_transport_service.model.dto.storage;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoredDocumentDTO {
    private String relativeKey;
    private String mediaType;
    private Long byteSize;
    private String sha256;
    @Builder.Default
    private Boolean isAccessible = true;
    private String warningSignal;
    private String warningMessage;
    private LocalDateTime lastModified;
}
