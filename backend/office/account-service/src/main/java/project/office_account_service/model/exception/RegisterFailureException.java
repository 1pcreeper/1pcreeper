package project.office_account_service.model.exception;

import lombok.Getter;

@Getter
public class RegisterFailureException extends RuntimeException{
    public RegisterFailureException(String message) {
        super(message);
    }
}