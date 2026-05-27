package project.general_dummy_service.handler;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import project.general_dummy_service.service.sync.UserSyncService;
import project.shared_general_starter.handler.base.JwtAuthRequestBaseHandler;

@Service
public class JwtAuthRequestHandler implements JwtAuthRequestBaseHandler {
    private final UserSyncService userSyncService;
    @Autowired
    public JwtAuthRequestHandler(UserSyncService userSyncService) {
        this.userSyncService = userSyncService;
    }
    @Override
    public void handle(Jwt jwt) {
        String idToken = jwt.getTokenValue();
        String uid = jwt.getSubject();
        userSyncService.findByUidSync(uid);
    }
}
