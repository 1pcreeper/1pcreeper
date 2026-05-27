package project.general_account_service.handler;

import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import project.general_account_service.service.sync.AppUserSyncService;
import project.shared_general_auth_starter.service.auth.FirebaseAuthService;
import project.shared_general_starter.handler.base.JwtAuthRequestBaseHandler;
import project.shared_general_starter.util.StringBlankUtil;

import java.util.Locale;

@Service
public class JwtAuthRequestHandler implements JwtAuthRequestBaseHandler {
    private final FirebaseAuthService firebaseAuthService;
    private final AppUserSyncService appUserSyncService;
    @Autowired
    public JwtAuthRequestHandler(
        FirebaseAuthService firebaseAuthService,
        AppUserSyncService appUserSyncService
    ){
        this.firebaseAuthService = firebaseAuthService;
        this.appUserSyncService = appUserSyncService;
    }
    @Override
    public void handle(Jwt jwt) {
        String idToken = jwt.getTokenValue();
        try{
            FirebaseToken decodedToken = firebaseAuthService.verifyIdToken(idToken);
            String uid = decodedToken.getUid();
            String email = decodedToken.getEmail().toLowerCase(Locale.ROOT);
            String displayName = StringBlankUtil.getOrBlankString(decodedToken.getName());
            //String name = (String) decodedToken.getClaims().get("name");
            appUserSyncService.findByUidSync(uid,email,displayName);
        } catch (FirebaseAuthException e) {
            throw new BadCredentialsException("idToken Invalid");
        }
    }
}
