package project.office_workforce_service.service.manager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import project.office_workforce_service.model.entity.OrganizationDetail;
import project.office_workforce_service.repository.OrganizationDetailRepository;
import project.office_workforce_service.service.base.AbstractBaseService;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

import java.util.Optional;

@Service
public class OrganizationDetailManagerService extends AbstractBaseService<OrganizationDetail, Long> {

    private final OrganizationDetailRepository organizationDetailRepository;

    @Autowired
    public OrganizationDetailManagerService(OrganizationDetailRepository organizationDetailRepository) {
        super(organizationDetailRepository, "OrganizationDetail");
        this.organizationDetailRepository = organizationDetailRepository;
    }

    public OrganizationDetail findByOrgId(Long orgId) {
        return organizationDetailRepository.findByOrgId(orgId)
            .orElseThrow(() -> new ResourceNotFoundException("OrganizationDetail not found for organization id: " + orgId));
    }

    public Optional<OrganizationDetail> findOptionalByOrgId(Long orgId) {
        return organizationDetailRepository.findByOrgId(orgId);
    }
}
