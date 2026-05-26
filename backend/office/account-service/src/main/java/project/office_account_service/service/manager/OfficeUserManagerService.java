package project.office_account_service.service.manager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import project.office_account_service.model.entity.OfficeUser;
import project.office_account_service.model.exception.ResourceNotFoundException;
import project.office_account_service.repository.OfficeUserRepository;
import project.office_account_service.service.base.AbstractBaseService;

import java.util.List;

@Service
public class OfficeUserManagerService extends AbstractBaseService<OfficeUser,Long> {
    private final OfficeUserRepository officeUserRepository;
    @Autowired
    public OfficeUserManagerService(OfficeUserRepository officeUserRepository) {
        super(officeUserRepository, "OfficeUser");
        this.officeUserRepository = officeUserRepository;
    }
    public OfficeUser findByUid(String uid){
        return officeUserRepository.findByUid(uid).orElseThrow(
            ()->new ResourceNotFoundException("Uid Not Found")
        );
    }
    public OfficeUser findByName(String name){
        return officeUserRepository.findByName(name).orElseThrow(
            ()->new UsernameNotFoundException("User Name Not Found")
        );
    }
    public Page<OfficeUser> findByNameContaining(String partialName, Pageable pageable){
        return officeUserRepository.findByNameContaining(partialName,pageable);
    }
    public List<OfficeUser> findByNameContaining(String partialName){
        return officeUserRepository.findByNameContaining(partialName);
    }
    public OfficeUser findByEmail(String email){
        return officeUserRepository.findByEmail(email).orElseThrow(
            ()-> new ResourceNotFoundException("Email Not Found")
        );
    }
}
