package project.office_workforce_service.model.dto.object;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffOccupationDTO {
    private Long id;
    private Long staffId;
    private Long occupationId;
    private String remark;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}