package project.office_expenditure_service.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OutcomeSubcategoryResponseDTO {
    private Long id;
    private UUID uid;
    private String name;
    private Long categoryId;
    private String categoryName;
    private Long companyId;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
