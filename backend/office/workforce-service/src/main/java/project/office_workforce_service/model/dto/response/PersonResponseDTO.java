package project.office_workforce_service.model.dto.response;

import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PersonResponseDTO {
    private Long id;
    private String nameEnglish;
    private String nameChinese;
    private String officeTel;
    private String mobileTel;
    private String email;
    private String hkId;
    private String cnId;
    private String moId;
    private String passportId;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}