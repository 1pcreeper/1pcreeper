package project.general_account_service.handler;

import com.google.firebase.auth.FirebaseAuthException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import project.general_account_service.service.account.AccountSyncService;
import project.shared_general_auth_starter.service.auth.FirebaseAuthService;
import project.shared_general_starter.handler.base.JwtAuthRequestBaseHandler;

@Service
public class JwtAuthRequestHandler implements JwtAuthRequestBaseHandler {
    private final FirebaseAuthService firebaseAuthService;
    private final AccountSyncService accountSyncService;
    @Autowired
    public JwtAuthRequestHandler(
        FirebaseAuthService firebaseAuthService,
        AccountSyncService accountSyncService
    ){
        this.firebaseAuthService = firebaseAuthService;
        this.accountSyncService = accountSyncService;
    }
    @Override
    public void handle(Jwt jwt) {
        String idToken = jwt.getTokenValue();
        try{
            accountSyncService.findUserByIdTokenSync(idToken);
        } catch (FirebaseAuthException e) {
            throw new BadCredentialsException("idToken Invalid");
        }
    }
}
