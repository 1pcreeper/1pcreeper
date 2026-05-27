package project.general_account_service.service.sync;

import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.Null;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import project.general_account_service.model.entity.AppUser;
import project.general_account_service.service.manager.AppUserManagerService;
import project.shared_general_auth_starter.service.auth.FirebaseAuthService;
import project.general_account_service.model.entity.enums.AppUserRole;
import project.shared_general_starter.model.exception.DatabaseUpdateFailureException;
import project.shared_general_starter.model.exception.PrincipalException;
import project.shared_general_starter.model.exception.ResourceNotFoundException;
import project.shared_general_starter.util.StringBlankUtil;

import java.util.Locale;
import java.util.Objects;
import java.util.Set;

@Service
@Slf4j
public class AppUserSyncService {
    private final AppUserManagerService appUserManagerService;
    private final FirebaseAuthService firebaseAuthService;

    @Autowired
    public AppUserSyncService(
        AppUserManagerService appUserManagerService,
        FirebaseAuthService firebaseAuthService
    ) {
        this.appUserManagerService = appUserManagerService;
        this.firebaseAuthService = firebaseAuthService;
    }

    public AppUser findByUidSync(String uid, @Nullable String email, @Nullable String displayName) {
        try {
            return appUserManagerService.findByUid(uid);
        } catch (ResourceNotFoundException e) {
            log.info("New SAML user {} detected, creating domain sync.", uid);
        }
        boolean isEmailNotExisted = false;
        boolean isUidNotExisted = false;
        if(Objects.nonNull(email)){
            try {
                if (Objects.nonNull(appUserManagerService.findByEmail(email))) {
                    throw new DatabaseUpdateFailureException("User Email Already existed");
                }
            } catch (ResourceNotFoundException e) {
                isEmailNotExisted = true;
            }
        }else{
            isEmailNotExisted = true;
        }
        if(Objects.nonNull(uid)){
            try {
                if (Objects.nonNull(appUserManagerService.findByUid(uid))) {
                    throw new DatabaseUpdateFailureException("User Uid Already existed");
                }
            } catch (ResourceNotFoundException e) {
                isUidNotExisted = true;
            }
        }else{
            throw new PrincipalException("Uid must be existed");
        }
       
        if (!(isEmailNotExisted || isUidNotExisted)) {
            throw new DatabaseUpdateFailureException("User Email Or Uid Already existed");
        }
        AppUser newAppUser = new AppUser();
        newAppUser.setUid(uid);
        newAppUser.setEmail(email);
        newAppUser.setDisplayName(displayName==null ? "User" : displayName.isBlank() ? "User" : displayName);
        newAppUser.setRoles(Set.of(AppUserRole.APP_USER));
        return appUserManagerService.save(newAppUser);
    }
}