package project.office_dummy_service.service.auth;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import project.office_dummy_service.service.manager.UserManagerService;
import project.shared_office_starter.model.exception.ResourceNotFoundException;
import project.shared_office_starter.service.base.UserDetailsBaseService;

@Service
public class UserDetailsAuthService implements UserDetailsBaseService {
    private final UserManagerService userManagerService;

    @Autowired
    public UserDetailsAuthService(
        UserManagerService userManagerService
    ) {
        this.userManagerService = userManagerService;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        try{
            return userManagerService.findByUid(username);
        }catch (ResourceNotFoundException e){
            throw new UsernameNotFoundException("User Not Found");
        }
    }
}