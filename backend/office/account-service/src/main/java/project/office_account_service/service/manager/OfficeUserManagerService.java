package project.office_account_service.service.manager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import project.general_account_service.model.entity.AppUser;
import project.general_account_service.repository.AppUserRepository;
import project.general_account_service.service.base.AbstractBaseService;
import project.shared_general_starter.model.exception.ResourceNotFoundException;

import java.util.List;

@Service
public class AppUserManagerService extends AbstractBaseService<AppUser,Long> {
    private final AppUserRepository appUserRepository;
    @Autowired
    public AppUserManagerService(AppUserRepository repository) {
        super(repository, "AppUser");
        this.appUserRepository = repository;
    }
    public AppUser findByUid(String uid){
        return appUserRepository.findByUid(uid).orElseThrow(
            ()->new ResourceNotFoundException("Uid Not Found")
        );
    }
    public AppUser findByName(String name){
        return appUserRepository.findByName(name).orElseThrow(
            ()->new UsernameNotFoundException("User Name Not Found")
        );
    }
    public Page<AppUser> findByNameContaining(String partialName, Pageable pageable){
        return appUserRepository.findByNameContaining(partialName,pageable);
    }
    public List<AppUser> findByNameContaining(String partialName){
        return appUserRepository.findByNameContaining(partialName);
    }
    public AppUser findByEmail(String email){
        return appUserRepository.findByEmail(email).orElseThrow(
            ()-> new ResourceNotFoundException("Email Not Found")
        );
    }
}
