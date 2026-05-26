package project.shared_general_starter.model.exception;

import lombok.Getter;

@Getter
public class ResourceNotFoundException extends RuntimeException{
    public ResourceNotFoundException(String message) {
        super(message);
    }
}