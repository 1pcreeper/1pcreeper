package project.shared_general_starter.handler.base;

import org.springframework.security.oauth2.jwt.Jwt;

public interface JwtAuthRequestBaseHandler {
    void handle(Jwt jwt);
}
