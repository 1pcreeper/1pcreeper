package project.general_account_service.model.dto.base;

import jakarta.annotation.Nullable;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class APIBaseResponseDTO<T> {
    private boolean success;
    private String message;
    private T data;

    public static <D> APIBaseResponseDTO<D> success(@Nullable D data){
        return APIBaseResponseDTO.<D>builder()
            .success(true)
            .message("")
            .data(data)
            .build();
    }

    public static APIBaseResponseDTO<Object> error(String message){
        return APIBaseResponseDTO.builder()
            .success(false)
            .message(message)
            .data(null)
            .build();
    }
}
