package project.office_expenditure_service.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OutcomeResponseDTO {
    private Long id;
    private UUID uid;
    private String name;
    private Long subcategoryId;
    private String subcategoryName;
    private BigDecimal defaultPrice;
    private Long companyId;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
