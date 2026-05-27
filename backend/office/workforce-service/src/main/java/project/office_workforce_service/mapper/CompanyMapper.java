package project.office_workforce_service.mapper;

import org.springframework.stereotype.Component;
import project.office_workforce_service.model.dto.request.CompanyCreateRequestDTO;
import project.office_workforce_service.model.dto.request.CompanyDetailRequestDTO;
import project.office_workforce_service.model.dto.request.CompanyUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.CompanyDetailResponseDTO;
import project.office_workforce_service.model.dto.response.CompanyResponseDTO;
import project.office_workforce_service.model.entity.Company;
import project.office_workforce_service.model.entity.CompanyDetail;

@Component
public class CompanyMapper {

    public Company toEntity(CompanyCreateRequestDTO request) {
        if (request == null) return null;

        return Company.builder()
            .nameEnglish(request.getNameEnglish())
            .nameChinese(request.getNameChinese())
            .businessRegistrationNumber(request.getBusinessRegistrationNumber())
            .secretaryLicenseNumber(request.getSecretaryLicenseNumber())
            .email(request.getEmail())
            .tel(request.getTel())
            .isActive(true)
            .build();
    }

    public CompanyDetail toDetailEntity(CompanyDetailRequestDTO request, Company company) {
        if (request == null || company == null) return null;

        return CompanyDetail.builder()
            .company(company)
            .bio(request.getBio())
            .address(request.getAddress())
            .industry(request.getIndustry())
            .website(request.getWebsite())
            .build();
    }

    public void updateEntity(CompanyUpdateRequestDTO request, Company entity) {
        if (request == null || entity == null) return;

        if (request.getNameEnglish() != null) entity.setNameEnglish(request.getNameEnglish());
        if (request.getNameChinese() != null) entity.setNameChinese(request.getNameChinese());
        if (request.getBusinessRegistrationNumber() != null) entity.setBusinessRegistrationNumber(request.getBusinessRegistrationNumber());
        if (request.getSecretaryLicenseNumber() != null) entity.setSecretaryLicenseNumber(request.getSecretaryLicenseNumber());
        if (request.getEmail() != null) entity.setEmail(request.getEmail());
        if (request.getTel() != null) entity.setTel(request.getTel());
        if (request.getIsActive() != null) entity.setIsActive(request.getIsActive());
    }

    public CompanyResponseDTO toResponseDTO(Company company, CompanyDetail detail) {
        if (company == null) return null;

        CompanyDetailResponseDTO detailResponse = null;
        if (detail != null) {
            detailResponse = CompanyDetailResponseDTO.builder()
                .bio(detail.getBio())
                .address(detail.getAddress())
                .industry(detail.getIndustry())
                .website(detail.getWebsite())
                .build();
        }

        return CompanyResponseDTO.builder()
            .id(company.getId())
            .nameEnglish(company.getNameEnglish())
            .nameChinese(company.getNameChinese())
            .businessRegistrationNumber(company.getBusinessRegistrationNumber())
            .secretaryLicenseNumber(company.getSecretaryLicenseNumber())
            .email(company.getEmail())
            .tel(company.getTel())
            .isActive(company.getIsActive())
            .details(detailResponse)
            .build();
    }
}