package project.shared_general_starter.model.dto.base;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PaginationBaseResponseDTO<DTO> {
    private List<DTO> content;
    private Integer pageNumber;
    private Integer pageSize;
    private Integer totalPages;
    private Long totalElements;
}
