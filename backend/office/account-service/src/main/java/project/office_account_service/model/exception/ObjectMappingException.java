package project.shared_general_starter.model.exception;

import lombok.Getter;

@Getter
public class ObjectMappingException extends RuntimeException{
    public ObjectMappingException(String message) {
        super(message);
    }
}