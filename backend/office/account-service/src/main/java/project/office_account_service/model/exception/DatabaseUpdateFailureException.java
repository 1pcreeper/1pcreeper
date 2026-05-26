package project.office_account_service.model.exception;

import lombok.Getter;

@Getter
public class DatabaseUpdateFailureException extends RuntimeException{
    public DatabaseUpdateFailureException(String message) {
        super(message);
    }
}
