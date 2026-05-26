package project.shared_general_starter.model.exception;

import lombok.Getter;

@Getter
public class UnAuthorizedException extends RuntimeException{
    public UnAuthorizedException(String message) {
        super(message);
    }
}