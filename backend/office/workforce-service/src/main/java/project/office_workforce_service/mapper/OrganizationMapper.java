package project.office_workforce_service.mapper;

import org.springframework.stereotype.Component;
import project.office_workforce_service.model.dto.object.OrganizationDTO;
import project.office_workforce_service.model.dto.request.OrganizationCreateRequestDTO;
import project.office_workforce_service.model.dto.request.OrganizationDetailRequestDTO;
import project.office_workforce_service.model.dto.request.OrganizationUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.OrganizationDetailResponseDTO;
import project.office_workforce_service.model.dto.response.OrganizationResponseDTO;
import project.office_workforce_service.model.entity.Organization;
import project.office_workforce_service.model.entity.OrganizationDetail;

import java.util.UUID;

import static project.shared_office_starter.util.StringBlankUtil.getNullIfBlank;

@Component
public class OrganizationMapper {

    public Organization toEntity(OrganizationCreateRequestDTO request) {
        if (request == null) return null;

        return Organization.builder()
            .uid(UUID.randomUUID())
            .nameEnglish(request.getNameEnglish())
            .nameChinese(request.getNameChinese())
            .businessRegistrationNumber(getNullIfBlank(request.getBusinessRegistrationNumber()))
            .secretaryLicenseNumber(getNullIfBlank(request.getSecretaryLicenseNumber()))
            .email(getNullIfBlank(request.getEmail()))
            .tel(getNullIfBlank(request.getTel()))
            .isActive(true)
            .build();
    }

    public void updateEntity(OrganizationUpdateRequestDTO request, Organization entity) {
        if (request == null || entity == null) return;

        if (request.getNameEnglish() != null) entity.setNameEnglish(request.getNameEnglish());
        if (request.getNameChinese() != null) entity.setNameChinese(request.getNameChinese());
        if (request.getBusinessRegistrationNumber() != null) {
            entity.setBusinessRegistrationNumber(getNullIfBlank(request.getBusinessRegistrationNumber()));
        }
        if (request.getSecretaryLicenseNumber() != null) {
            entity.setSecretaryLicenseNumber(getNullIfBlank(request.getSecretaryLicenseNumber()));
        }
        if (request.getEmail() != null) entity.setEmail(getNullIfBlank(request.getEmail()));
        if (request.getTel() != null) entity.setTel(getNullIfBlank(request.getTel()));
        if (request.getIsActive() != null) entity.setIsActive(request.getIsActive());
    }

    public OrganizationResponseDTO toResponseDTO(Organization org) {
        if (org == null) return null;

        return OrganizationResponseDTO.builder()
            .id(org.getId())
            .uid(org.getUid())
            .nameEnglish(org.getNameEnglish())
            .nameChinese(org.getNameChinese())
            .businessRegistrationNumber(org.getBusinessRegistrationNumber())
            .secretaryLicenseNumber(org.getSecretaryLicenseNumber())
            .email(org.getEmail())
            .tel(org.getTel())
            .isActive(org.getIsActive())
            .createdAt(org.getCreatedAt())
            .updatedAt(org.getUpdatedAt())
            .createdBy(org.getCreatedBy() != null ? org.getCreatedBy().getId() : null)
            .updatedBy(org.getUpdatedBy() != null ? org.getUpdatedBy().getId() : null)
            .build();
    }

    public OrganizationDTO toOrganizationDTO(Organization org) {
        if (org == null) return null;

        return OrganizationDTO.builder()
            .id(org.getId())
            .uid(org.getUid())
            .nameEnglish(org.getNameEnglish())
            .nameChinese(org.getNameChinese())
            .businessRegistrationNumber(org.getBusinessRegistrationNumber())
            .secretaryLicenseNumber(org.getSecretaryLicenseNumber())
            .email(org.getEmail())
            .tel(org.getTel())
            .isActive(org.getIsActive())
            .createdAt(org.getCreatedAt())
            .updatedAt(org.getUpdatedAt())
            .build();
    }

    public OrganizationDetail toDetailEntity(OrganizationDetailRequestDTO request, Organization organization) {
        if (request == null || organization == null) return null;

        return OrganizationDetail.builder()
            .organization(organization)
            .bio(request.getBio())
            .address(request.getAddress())
            .industry(request.getIndustry())
            .website(request.getWebsite())
            .build();
    }

    public OrganizationDetailResponseDTO toDetailResponse(OrganizationDetail detail) {
        if (detail == null) return null;

        return OrganizationDetailResponseDTO.builder()
            .id(detail.getId())
            .orgId(detail.getOrganization() != null ? detail.getOrganization().getId() : null)
            .bio(detail.getBio())
            .address(detail.getAddress())
            .industry(detail.getIndustry())
            .website(detail.getWebsite())
            .createdAt(detail.getCreatedAt())
            .updatedAt(detail.getUpdatedAt())
            .build();
    }
}
