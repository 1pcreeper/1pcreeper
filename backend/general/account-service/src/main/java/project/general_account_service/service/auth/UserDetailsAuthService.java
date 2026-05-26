package project.general_account_service.service.auth;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import project.general_account_service.service.sync.AppUserSyncService;
import project.general_account_service.service.manager.AppUserManagerService;
import project.shared_general_starter.model.exception.ResourceNotFoundException;
import project.shared_general_starter.service.base.UserDetailsBaseService;

@Service
public class UserDetailsAuthService implements UserDetailsBaseService {
    private final AppUserManagerService appUserManagerService;
    private final AppUserSyncService appUserSyncService;

    @Autowired
    public UserDetailsAuthService(
        AppUserManagerService appUserManagerService,
        AppUserSyncService appUserSyncService
    ) {
        this.appUserManagerService = appUserManagerService;
        this.appUserSyncService = appUserSyncService;
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