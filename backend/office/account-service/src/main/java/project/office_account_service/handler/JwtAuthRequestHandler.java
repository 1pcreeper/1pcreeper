package project.office_account_service.handler;

import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import project.shared_office_starter.handler.base.JwtAuthRequestBaseHandler;

@Service
public class JwtAuthRequestHandler implements JwtAuthRequestBaseHandler {
    @Override
    public void handle(Jwt jwt) {
        String idToken = jwt.getTokenValue();
        
    }
}
