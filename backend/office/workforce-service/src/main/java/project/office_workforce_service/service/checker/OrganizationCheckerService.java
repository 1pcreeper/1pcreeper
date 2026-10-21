package project.office_workforce_service.service.checker;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import project.office_workforce_service.model.dto.request.OrganizationCreateRequestDTO;
import project.office_workforce_service.model.dto.request.OrganizationUpdateRequestDTO;
import project.office_workforce_service.model.entity.Organization;
import project.office_workforce_service.service.manager.OrganizationManagerService;
import project.shared_office_starter.model.exception.PropertyValidationException;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

@Service
public class OrganizationCheckerService {

    private final OrganizationManagerService organizationManagerService;

    @Autowired
    public OrganizationCheckerService(OrganizationManagerService organizationManagerService) {
        this.organizationManagerService = organizationManagerService;
    }

    public void checkOrganizationIsActive(Organization org) {
        if (org == null || !Boolean.TRUE.equals(org.getIsActive())) {
            throw new ResourceNotFoundException("Organization not found or has been deactivated.");
        }
    }

    public void checkCreateRequest(OrganizationCreateRequestDTO dto) {
        if (dto.getBusinessRegistrationNumber() != null && !dto.getBusinessRegistrationNumber().isBlank()) {
            String brn = dto.getBusinessRegistrationNumber().trim();
            if (organizationManagerService.existsByBusinessRegistrationNumber(brn)) {
                throw new PropertyValidationException("Organization with Business Registration Number " + brn + " already exists.");
            }
        }

        if (dto.getSecretaryLicenseNumber() != null && !dto.getSecretaryLicenseNumber().isBlank()) {
            String sln = dto.getSecretaryLicenseNumber().trim();
            if (organizationManagerService.existsBySecretaryLicenseNumber(sln)) {
                throw new PropertyValidationException("Organization with Secretary License Number " + sln + " already exists.");
            }
        }
    }

    public void checkUpdateRequest(Long currentId, OrganizationUpdateRequestDTO dto) {
        if (dto.getBusinessRegistrationNumber() != null && !dto.getBusinessRegistrationNumber().isBlank()) {
            String brn = dto.getBusinessRegistrationNumber().trim();
            organizationManagerService.findByBusinessRegistrationNumber(brn)
                .ifPresent(existing -> {
                    if (!existing.getId().equals(currentId)) {
                        throw new PropertyValidationException("Another organization already holds Business Registration Number " + brn);
                    }
                });
        }

        if (dto.getSecretaryLicenseNumber() != null && !dto.getSecretaryLicenseNumber().isBlank()) {
            String sln = dto.getSecretaryLicenseNumber().trim();
            organizationManagerService.findBySecretaryLicenseNumber(sln)
                .ifPresent(existing -> {
                    if (!existing.getId().equals(currentId)) {
                        throw new PropertyValidationException("Another organization already holds Secretary License Number " + sln);
                    }
                });
        }
    }
}
