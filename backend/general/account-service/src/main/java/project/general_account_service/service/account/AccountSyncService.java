package project.general_account_service.service.account;

import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import project.general_account_service.model.entity.AppUser;
import project.general_account_service.service.manager.AppUserManagerService;
import project.shared_general_auth_starter.service.auth.FirebaseAuthService;
import project.shared_general_common_lib.constant.AppUserRole;
import project.shared_general_starter.model.exception.DatabaseUpdateFailureException;

import java.util.Locale;
import java.util.Set;

@Service
@Slf4j
public class AccountSyncService {
    private final AppUserManagerService appUserManagerService;
    private final FirebaseAuthService firebaseAuthService;
    @Autowired
    public AccountSyncService(
        AppUserManagerService appUserManagerService,
        FirebaseAuthService firebaseAuthService
    ){
        this.appUserManagerService = appUserManagerService;
        this.firebaseAuthService = firebaseAuthService;
    }
    
    public AppUser findUserByIdTokenSync(String idToken) throws FirebaseAuthException {
        FirebaseToken decodedToken = firebaseAuthService.verifyIdToken(idToken);
        String uid = decodedToken.getUid();
        String email = decodedToken.getEmail().toLowerCase(Locale.ROOT);
        //String name = (String) decodedToken.getClaims().get("name");
        
        return appUserManagerService.findByUid(uid)
            .orElseGet(() -> {
                log.info("New SAML user {} detected, creating domain account.", email);
                
                if(appUserManagerService.findByEmail(email).isPresent()){
                    throw new DatabaseUpdateFailureException("User Email Already existed");
                }
                if(appUserManagerService.findByUid(uid).isPresent()){
                    throw new DatabaseUpdateFailureException("User Uid Already existed");
                }
                AppUser newAppUser = new AppUser();
                newAppUser.setUid(uid);
                newAppUser.setEmail(email);
                newAppUser.setDisplayName("User");
                newAppUser.setRoles(Set.of(AppUserRole.APP_USER));
                return appUserManagerService.save(newAppUser);
            });
    }
}