package project.office_account_service.model.exception;

import lombok.Getter;

@Getter
public class PrincipalException extends RuntimeException{
    public PrincipalException(String message) {
        super(message);
    }
}