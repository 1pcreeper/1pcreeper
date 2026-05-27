package project.office_dummy_service.service.manager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import project.office_dummy_service.model.entity.User;
import project.office_dummy_service.repository.UserRepository;
import project.office_dummy_service.service.base.AbstractBaseService;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

import java.util.List;

@Service
public class UserManagerService extends AbstractBaseService<User,Long> {
    private final UserRepository userRepository;
    @Autowired
    public UserManagerService(UserRepository userRepository) {
        super(userRepository, "OfficeUser");
        this.userRepository = userRepository;
    }
    public User findByUid(String uid){
        return userRepository.findByUid(uid).orElseThrow(
            ()->new ResourceNotFoundException("Uid Not Found")
        );
    }
}
