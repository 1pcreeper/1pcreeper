package project.shared_general_starter.mapper;

import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;
import project.shared_general_starter.model.dto.base.PaginationBaseResponseDTO;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class PaginationMapper {

    public <T, R> PaginationBaseResponseDTO<R> toDTO(Page<T> page, Function<T, R> mapperFunction) {
        List<R> content = page.getContent().stream()
            .map(mapperFunction)
            .collect(Collectors.toList());

        return PaginationBaseResponseDTO.<R>builder()
            .content(content)
            .pageNumber(page.getNumber())
            .pageSize(page.getSize())
            .totalPages(page.getTotalPages())
            .totalElements(page.getTotalElements())
            .build();
    }
}