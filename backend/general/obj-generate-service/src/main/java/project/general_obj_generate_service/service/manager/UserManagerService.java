package project.general_obj_generate_service.service.manager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import project.general_obj_generate_service.model.entity.User;
import project.general_obj_generate_service.repository.UserRepository;
import project.general_obj_generate_service.service.base.AbstractBaseService;
import project.shared_general_starter.model.exception.ResourceNotFoundException;

import java.util.List;

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
