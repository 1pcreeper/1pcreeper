package project.office_transport_service.model.dto.object;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PersonSummaryDTO {
    private UUID uid;
    private String nameEnglish;
    private String nameChinese;
    private String mobileTel;
    private String officeTel;
    private String email;
    private String hkId;
    private Boolean isActive;
}
