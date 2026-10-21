package project.office_expenditure_service.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.office_expenditure_service.model.entity.enums.IntervalPeriod;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffSalaryExpenseResponseDTO {
    private Long id;
    private UUID uid;
    private String name;
    private Long staffSalaryId;
    private BigDecimal cost;
    private IntervalPeriod period;
    private LocalDateTime invokedAt;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private Long companyId;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
