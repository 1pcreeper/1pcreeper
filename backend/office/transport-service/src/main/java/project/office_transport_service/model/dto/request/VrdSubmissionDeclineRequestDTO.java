package project.office_transport_service.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VrdSubmissionDeclineRequestDTO {
    @NotBlank(message = "Reason for declining cannot be blank")
    private String reason;
}
