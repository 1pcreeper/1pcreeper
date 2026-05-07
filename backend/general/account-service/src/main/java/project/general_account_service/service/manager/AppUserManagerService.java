package project.general_account_service.service.manager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.source.MapConfigurationPropertySource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Service;
import project.general_account_service.model.entity.AppUser;
import project.general_account_service.repository.AppUserRepository;
import project.general_account_service.repository.base.AbstractBaseRepository;
import project.general_account_service.service.base.AbstractBaseService;

import java.util.List;
import java.util.Optional;

@Service
public class AppUserManagerService extends AbstractBaseService<AppUser,Long> {
    private final AppUserRepository appUserRepository;
    @Autowired
    public AppUserManagerService(AppUserRepository repository) {
        super(repository, "AppUser");
        this.appUserRepository = repository;
    }
    public Optional<AppUser> findByUid(String uid){
        return appUserRepository.findByUid(uid);
    }
    public Optional<AppUser> findByName(String name){
        return appUserRepository.findByName(name);
    }
    public boolean existsByName(String name){
        return appUserRepository.existsByName(name);
    }
    public Page<AppUser> findByNameContaining(@Param("partialName") String partialName, Pageable pageable){
        return appUserRepository.findByNameContaining(partialName,pageable);
    }
    public List<AppUser> findByNameContaining(@Param("partialName") String partialName){
        return appUserRepository.findByNameContaining(partialName);
    }
}
