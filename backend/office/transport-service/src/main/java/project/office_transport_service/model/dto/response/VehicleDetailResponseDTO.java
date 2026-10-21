package project.office_transport_service.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.office_transport_service.model.dto.object.PersonSummaryDTO;
import project.office_transport_service.model.dto.object.VehicleDTO;
import project.office_transport_service.model.dto.object.VehicleDetailDTO;
import project.office_transport_service.model.dto.object.VehicleVrdDTO;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleDetailResponseDTO {
    private VehicleDTO vehicle;
    private VehicleDetailDTO detail;
    private List<VehicleVrdDTO> vrds;
    private PersonSummaryDTO owner;
}
