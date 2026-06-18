package project.office_expenditure_service.handler;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import project.office_expenditure_service.service.sync.UserSyncService;
import project.shared_office_starter.handler.base.JwtAuthRequestBaseHandler;

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
