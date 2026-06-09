package project.general_obj_generate_service.service.sync;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import project.general_obj_generate_service.model.entity.User;
import project.general_obj_generate_service.model.entity.enums.UserRole;
import project.general_obj_generate_service.service.manager.UserManagerService;
import project.shared_general_starter.model.exception.ResourceNotFoundException;

import java.util.Set;

@Service
@Slf4j
public class UserSyncService {
    private final UserManagerService userManagerService;

    @Autowired
    public UserSyncService(
        UserManagerService userManagerService
    ) {
        this.userManagerService = userManagerService;
    }

    public User findByUidSync(String uid)  {
        try {
            return userManagerService.findByUid(uid);
        } catch (ResourceNotFoundException e) {
            log.info("New SAML user {} detected, creating domain sync.", uid);
        }
        User newUser = new User();
        newUser.setUid(uid);
        newUser.setRoles(Set.of(UserRole.OBJ_GENERATE_USER));
        return userManagerService.save(newUser);
    }
}