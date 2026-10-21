package project.office_transport_service.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExplorerItemResponseDTO {
    private String name;
    private String relativePath;
    private Boolean isFolder;
    private Long byteSize;
    private LocalDateTime lastModified;
    @Builder.Default
    private Boolean isAccessible = true;
    private String warningSignal;
    private String warningMessage;
}
