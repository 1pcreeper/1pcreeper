package project.office_transport_service.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleExplorerResponseDTO {
    private Long vehicleId;
    private UUID vehicleUid;
    private String currentFolder;
    private List<ExplorerItemResponseDTO> items;
    private Boolean hasWarnings;
}
