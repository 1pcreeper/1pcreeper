package project.shared_general_starter.model.exception;

import lombok.Getter;

@Getter
public class DatabaseUpdateFailureException extends RuntimeException{
    public DatabaseUpdateFailureException(String message) {
        super(message);
    }
}
