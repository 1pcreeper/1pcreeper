package project.office_workforce_service.service.manager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import project.office_workforce_service.model.entity.User;
import project.office_workforce_service.repository.UserRepository;
import project.office_workforce_service.service.base.AbstractBaseService;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

@Service
public class UserManagerService extends AbstractBaseService<User,Long> {
    private final UserRepository userRepository;
    @Autowired
    public UserManagerService(UserRepository userRepository) {
        super(userRepository, "User");
        this.userRepository = userRepository;
    }
    public User findByUid(String uid){
        return userRepository.findByUid(uid).orElseThrow(
            ()->new ResourceNotFoundException("Uid Not Found")
        );
    }
}
