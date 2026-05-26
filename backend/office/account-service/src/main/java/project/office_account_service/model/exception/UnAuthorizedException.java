package project.office_account_service.model.exception;

import lombok.Getter;

@Getter
public class UnAuthorizedException extends RuntimeException{
    public UnAuthorizedException(String message) {
        super(message);
    }
}