package project.office_account_service.model.exception;

import lombok.Getter;

@Getter
public class ObjectMappingException extends RuntimeException{
    public ObjectMappingException(String message) {
        super(message);
    }
}