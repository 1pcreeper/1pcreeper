package project.office_workforce_service.mapper;

import org.springframework.stereotype.Component;
import project.office_workforce_service.model.dto.request.OrganizationCreateRequestDTO;
import project.office_workforce_service.model.dto.request.OrganizationUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.OrganizationResponseDTO;
import project.office_workforce_service.model.entity.Company;
import project.office_workforce_service.model.entity.Organization;

@Component
public class OrganizationMapper {

    public Organization toEntity(OrganizationCreateRequestDTO request, Company company) {
        if (request == null) return null;

        return Organization.builder()
            .company(company) // Passed in from the Service after validation
            .name(request.getName())
            .bio(request.getBio())
            .isActive(true)
            .build();
    }

    public void updateEntity(OrganizationUpdateRequestDTO request, Organization entity) {
        if (request == null || entity == null) return;

        if (request.getName() != null) entity.setName(request.getName());
        if (request.getBio() != null) entity.setBio(request.getBio());
        entity.setIsActive(true);
    }

    public OrganizationResponseDTO toResponseDTO(Organization organization) {
        if (organization == null) return null;

        return OrganizationResponseDTO.builder()
            .id(organization.getId())
            .companyId(organization.getCompany() != null ? organization.getCompany().getId() : null)
            .name(organization.getName())
            .bio(organization.getBio())
            .isActive(organization.getIsActive())
            .build();
    }
}