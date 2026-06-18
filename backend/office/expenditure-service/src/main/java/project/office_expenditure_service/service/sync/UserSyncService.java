package project.office_expenditure_service.service.sync;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import project.office_expenditure_service.model.entity.User;
import project.office_expenditure_service.model.entity.enums.UserRole;
import project.office_expenditure_service.service.manager.UserManagerService;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

import java.util.Set;

@Service
public class UserSyncService {
    private final UserManagerService userManagerService;
    @Autowired
    public UserSyncService(
        UserManagerService userManagerService
    ) {
        this.userManagerService = userManagerService;
    }
    public User findByUidSync(String uid){
        try{
            return userManagerService.findByUid(uid);
        }catch (ResourceNotFoundException ignored){
            
        }
        User newUser = User.builder()
            .uid(uid)
            .roles(Set.of(UserRole.EXPENDITURE_USER))
            .build();
        return userManagerService.save(newUser);
    }
}
