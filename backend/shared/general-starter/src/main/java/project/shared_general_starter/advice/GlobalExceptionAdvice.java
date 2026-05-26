package project.shared_general_starter.advice;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import project.shared_general_starter.model.exception.*;
import project.shared_general_starter.model.dto.base.APIBaseResponseDTO;

@RestControllerAdvice
public class GlobalExceptionAdvice {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<APIBaseResponseDTO<Object>> handleResourceNotFoundException(ResourceNotFoundException e){
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
            APIBaseResponseDTO.error(e.getMessage())
        );
    }

    @ExceptionHandler(UnAuthorizedException.class)
    public ResponseEntity<APIBaseResponseDTO<Object>> handleUnAuthorizedException(UnAuthorizedException e){
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
            APIBaseResponseDTO.error(e.getMessage())
        );
    }

    @ExceptionHandler(RegisterFailureException.class)
    public ResponseEntity<APIBaseResponseDTO> handleRegisterFailureException(RegisterFailureException e){
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
            APIBaseResponseDTO.error(e.getMessage())
        );
    }

    @ExceptionHandler(PrincipalException.class)
    public ResponseEntity<APIBaseResponseDTO<Object>> handlePrincipalException(PrincipalException e){
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
            APIBaseResponseDTO.error(e.getMessage())
        );
    }

    @ExceptionHandler(DatabaseUpdateFailureException.class)
    public ResponseEntity<APIBaseResponseDTO<Object>> handleDatabaseUpdateFailureException(DatabaseUpdateFailureException e){
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(
            APIBaseResponseDTO.error(e.getMessage())
        );
    }

    @ExceptionHandler(PropertyValidationException.class)
    public ResponseEntity<APIBaseResponseDTO<Object>> handlePropertyValidationException(PropertyValidationException e){
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
            APIBaseResponseDTO.error(e.getMessage())
        );
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<APIBaseResponseDTO<Object>> handleIllegalArgumentException(IllegalArgumentException e){
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
            APIBaseResponseDTO.error(e.getMessage())
        );
    }

    @ExceptionHandler(ObjectMappingException.class)
    public ResponseEntity<APIBaseResponseDTO<Object>> handleObjectMappingException(ObjectMappingException e){
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(
            APIBaseResponseDTO.error(e.getMessage())
        );
    }

}
