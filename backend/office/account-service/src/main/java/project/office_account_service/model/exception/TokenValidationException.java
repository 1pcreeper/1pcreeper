package project.shared_general_starter.model.exception;

import lombok.Getter;

@Getter
public class TokenValidationException extends RuntimeException {
    public TokenValidationException(String message) {
      super(message);
    }
}
