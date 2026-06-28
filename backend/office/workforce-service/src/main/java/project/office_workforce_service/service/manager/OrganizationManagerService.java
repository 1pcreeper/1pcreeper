package project.office_workforce_service.service.manager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Service;
import project.office_workforce_service.model.entity.Organization;
import project.office_workforce_service.repository.OrganizationRepository;
import project.office_workforce_service.service.base.AbstractBaseService;

@Service
public class OrganizationManagerService extends AbstractBaseService<Organization, Long> {

    private final OrganizationRepository organizationRepository;

    @Autowired
    public OrganizationManagerService(OrganizationRepository organizationRepository) {
        super(organizationRepository, "Organization");
        this.organizationRepository = organizationRepository;
    }

    public Page<Organization> search(Long companyId, String q, Boolean isActive, Pageable pageable) {
        return organizationRepository.search(companyId, q, isActive, pageable);
    }
    
    public Page<Organization> findAllByIsActive(Boolean isActive, Pageable pageable){
        return organizationRepository.findAllByIsActive(isActive,pageable);
    }
}