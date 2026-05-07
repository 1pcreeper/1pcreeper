package project.general_account_service.service.auth;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import project.general_account_service.service.manager.AppUserManagerService;
import project.shared_general_starter.service.base.UserDetailsBaseService;

@Service
public class UserDetailsAuthService implements UserDetailsBaseService {
    private final AppUserManagerService appUserManagerService;
    @Autowired
    public UserDetailsAuthService(
        AppUserManagerService appUserManagerService
    ){
        this.appUserManagerService = appUserManagerService;
    }
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return appUserManagerService.findByUid(username).orElseThrow(
            ()-> new UsernameNotFoundException("Invalid Credential")
        );
    }
}