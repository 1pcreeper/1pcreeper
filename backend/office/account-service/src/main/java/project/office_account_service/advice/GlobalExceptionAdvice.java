package project.shared_general_starter.advice;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import project.shared_general_starter.model.exception.*;
import project.shared_general_starter.model.vo.response.APIResponseVO;

@RestControllerAdvice
public class GlobalExceptionAdvice {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<APIResponseVO<Object>> handleResourceNotFoundException(ResourceNotFoundException e){
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
            APIResponseVO.error(e.getMessage())
        );
    }

    @ExceptionHandler(UnAuthorizedException.class)
    public ResponseEntity<APIResponseVO<Object>> handleUnAuthorizedException(UnAuthorizedException e){
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
            APIResponseVO.error(e.getMessage())
        );
    }

    @ExceptionHandler(RegisterFailureException.class)
    public ResponseEntity<APIResponseVO> handleRegisterFailureException(RegisterFailureException e){
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
            APIResponseVO.error(e.getMessage())
        );
    }

    @ExceptionHandler(PrincipalException.class)
    public ResponseEntity<APIResponseVO<Object>> handlePrincipalException(PrincipalException e){
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
            APIResponseVO.error(e.getMessage())
        );
    }

    @ExceptionHandler(DatabaseUpdateFailureException.class)
    public ResponseEntity<APIResponseVO<Object>> handleDatabaseUpdateFailureException(DatabaseUpdateFailureException e){
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(
            APIResponseVO.error(e.getMessage())
        );
    }

    @ExceptionHandler(PropertyValidationException.class)
    public ResponseEntity<APIResponseVO<Object>> handlePropertyValidationException(PropertyValidationException e){
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
            APIResponseVO.error(e.getMessage())
        );
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<APIResponseVO<Object>> handleIllegalArgumentException(IllegalArgumentException e){
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
            APIResponseVO.error(e.getMessage())
        );
    }

    @ExceptionHandler(ObjectMappingException.class)
    public ResponseEntity<APIResponseVO<Object>> handleObjectMappingException(ObjectMappingException e){
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(
            APIResponseVO.error(e.getMessage())
        );
    }

}
