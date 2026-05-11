package project.general_account_service.service.auth;


import com.google.firebase.auth.FirebaseAuthException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import project.general_account_service.service.account.AccountSyncService;
import project.general_account_service.service.manager.AppUserManagerService;
import project.shared_general_starter.model.exception.DatabaseUpdateFailureException;
import project.shared_general_starter.model.exception.ResourceNotFoundException;
import project.shared_general_starter.service.base.UserDetailsBaseService;

import java.util.Objects;

@Service
public class UserDetailsAuthService implements UserDetailsBaseService {
    private final AppUserManagerService appUserManagerService;
    private final AccountSyncService accountSyncService;

    @Autowired
    public UserDetailsAuthService(
        AppUserManagerService appUserManagerService,
        AccountSyncService accountSyncService
    ) {
        this.appUserManagerService = appUserManagerService;
        this.accountSyncService = accountSyncService;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        try{
            return appUserManagerService.findByUid(username);
        }catch (ResourceNotFoundException e){
            throw new UsernameNotFoundException("User Not Found");
        }
    }
}