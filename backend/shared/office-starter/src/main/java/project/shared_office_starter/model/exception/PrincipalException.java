package project.shared_office_starter.model.exception;

import lombok.Getter;

@Getter
public class PrincipalException extends RuntimeException{
    public PrincipalException(String message) {
        super(message);
    }
}