package project.office_workforce_service.service.checker;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import project.office_workforce_service.model.dto.request.CompanyCreateRequestDTO;
import project.office_workforce_service.model.dto.request.CompanyUpdateRequestDTO;
import project.office_workforce_service.model.entity.Company;
import project.office_workforce_service.service.manager.CompanyManagerService;
import project.shared_office_starter.model.exception.PropertyValidationException;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

@Service
public class CompanyCheckerService {

    private final CompanyManagerService companyManagerService;

    @Autowired
    public CompanyCheckerService(CompanyManagerService companyManagerService) {
        this.companyManagerService = companyManagerService;
    }

    public void checkCompanyIsActive(Company company) {
        if (company == null || !Boolean.TRUE.equals(company.getIsActive())) {
            throw new ResourceNotFoundException("Company not found or has been deactivated.");
        }
    }

    public void checkCreateRequest(CompanyCreateRequestDTO dto) {
        if (dto == null) {
            throw new PropertyValidationException("Company creation payload cannot be null.");
        }
        if (dto.getNameEnglish() == null || dto.getNameEnglish().isBlank()) {
            throw new PropertyValidationException("Company English name cannot be blank.");
        }
        if (companyManagerService.existsByNameEnglishIgnoreCase(dto.getNameEnglish().trim())) {
            throw new PropertyValidationException("Company with English name '" + dto.getNameEnglish() + "' already exists.");
        }
        if (dto.getBusinessRegistrationNumber() != null && !dto.getBusinessRegistrationNumber().isBlank()) {
            String brn = dto.getBusinessRegistrationNumber().trim();
            if (companyManagerService.existsByBusinessRegistrationNumber(brn)) {
                throw new PropertyValidationException("Company with Business Registration Number '" + brn + "' already exists.");
            }
        }
    }

    public void checkUpdateRequest(Long currentId, CompanyUpdateRequestDTO dto) {
        if (dto == null) {
            throw new PropertyValidationException("Company update payload cannot be null.");
        }
        if (dto.getBusinessRegistrationNumber() != null && !dto.getBusinessRegistrationNumber().isBlank()) {
            String brn = dto.getBusinessRegistrationNumber().trim();
            companyManagerService.findByBusinessRegistrationNumber(brn)
                .ifPresent(existing -> {
                    if (!existing.getId().equals(currentId)) {
                        throw new PropertyValidationException("Another company already holds Business Registration Number '" + brn + "'.");
                    }
                });
        }
    }
}
