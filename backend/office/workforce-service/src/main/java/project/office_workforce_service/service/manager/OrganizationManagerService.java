package project.office_workforce_service.service.manager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import project.office_workforce_service.model.entity.Organization;
import project.office_workforce_service.repository.OrganizationRepository;
import project.office_workforce_service.service.base.AbstractBaseService;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

import java.util.Optional;
import java.util.UUID;

@Service
public class OrganizationManagerService extends AbstractBaseService<Organization, Long> {

    private final OrganizationRepository organizationRepository;

    @Autowired
    public OrganizationManagerService(OrganizationRepository organizationRepository) {
        super(organizationRepository, "Organization");
        this.organizationRepository = organizationRepository;
    }

    public Page<Organization> search(String q, Boolean isActive, Pageable pageable) {
        return organizationRepository.search(q, isActive, pageable);
    }

    public Page<Organization> findAllByIsActive(Boolean isActive, Pageable pageable) {
        return organizationRepository.findAllByIsActive(isActive, pageable);
    }

    public Organization findByUid(UUID uid) {
        return organizationRepository.findByUid(uid)
            .orElseThrow(() -> new ResourceNotFoundException("Organization not found by UID: " + uid));
    }

    public Optional<Organization> findByBusinessRegistrationNumber(String brn) {
        return organizationRepository.findByBusinessRegistrationNumber(brn);
    }

    public Optional<Organization> findBySecretaryLicenseNumber(String sln) {
        return organizationRepository.findBySecretaryLicenseNumber(sln);
    }

    public boolean existsByBusinessRegistrationNumber(String brn) {
        return organizationRepository.existsByBusinessRegistrationNumber(brn);
    }

    public boolean existsBySecretaryLicenseNumber(String sln) {
        return organizationRepository.existsBySecretaryLicenseNumber(sln);
    }
}
