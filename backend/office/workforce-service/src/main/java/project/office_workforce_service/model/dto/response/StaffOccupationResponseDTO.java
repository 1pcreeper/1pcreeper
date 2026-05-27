package project.office_workforce_service.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffOccupationResponseDTO {
    private Long id;
    private Long staffId;
    private Long occupationId;
    private String occupationName; // Convenient for the frontend UI
    private String remark;
}