package project.shared_office_starter.model.exception;

import lombok.Getter;

@Getter
public class TaskProcessingException extends RuntimeException{
    public TaskProcessingException(String message) {
        super(message);
    }
}
