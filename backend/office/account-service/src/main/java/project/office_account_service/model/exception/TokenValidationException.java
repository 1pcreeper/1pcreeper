package project.office_account_service.model.exception;

import lombok.Getter;

@Getter
public class TokenValidationException extends RuntimeException {
    public TokenValidationException(String message) {
      super(message);
    }
}
