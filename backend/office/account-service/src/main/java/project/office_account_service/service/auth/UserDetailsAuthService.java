package project.office_account_service.service.auth;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import project.office_account_service.model.exception.ResourceNotFoundException;
import project.office_account_service.service.manager.OfficeUserManagerService;

@Service
public class UserDetailsAuthService implements UserDetailsService {
    private final OfficeUserManagerService officeUserManagerService;

    @Autowired
    public UserDetailsAuthService(
        OfficeUserManagerService officeUserManagerService
    ) {
        this.officeUserManagerService = officeUserManagerService;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        try{
            return officeUserManagerService.findByUid(username);
        }catch (ResourceNotFoundException e){
            throw new UsernameNotFoundException("User Not Found");
        }
    }
}