package project.shared_office_starter.model.exception;

import lombok.Getter;

@Getter
public class RegisterFailureException extends RuntimeException{
    public RegisterFailureException(String message) {
        super(message);
    }
}