package project.office_account_service.model.exception;

import lombok.Getter;

@Getter
public class PropertyValidationException extends RuntimeException {
  public PropertyValidationException(String message) {
    super(message);
  }
}
