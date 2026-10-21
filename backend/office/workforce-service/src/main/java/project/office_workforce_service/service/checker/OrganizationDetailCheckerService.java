package project.office_workforce_service.service.checker;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import project.office_workforce_service.model.dto.request.OrganizationDetailRequestDTO;
import project.office_workforce_service.service.manager.OrganizationManagerService;
import project.shared_office_starter.model.exception.PropertyValidationException;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

@Service
public class OrganizationDetailCheckerService {

    private final OrganizationManagerService organizationManagerService;

    @Autowired
    public OrganizationDetailCheckerService(OrganizationManagerService organizationManagerService) {
        this.organizationManagerService = organizationManagerService;
    }

    public void checkUpsertRequest(Long orgId, OrganizationDetailRequestDTO dto) {
        if (dto == null) {
            throw new PropertyValidationException("Organization detail payload cannot be null.");
        }
        if (!organizationManagerService.existsById(orgId)) {
            throw new ResourceNotFoundException("Organization with ID " + orgId + " does not exist.");
        }
    }
}
