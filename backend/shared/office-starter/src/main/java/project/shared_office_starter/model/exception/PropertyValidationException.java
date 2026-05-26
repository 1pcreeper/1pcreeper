package project.shared_office_starter.model.exception;

import lombok.Getter;

@Getter
public class PropertyValidationException extends RuntimeException {
  public PropertyValidationException(String message) {
    super(message);
  }
}
