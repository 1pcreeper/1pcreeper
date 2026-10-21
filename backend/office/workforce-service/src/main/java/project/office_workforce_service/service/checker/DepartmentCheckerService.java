package project.office_workforce_service.service.checker;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import project.office_workforce_service.model.dto.request.DepartmentCreateRequestDTO;
import project.office_workforce_service.model.dto.request.DepartmentUpdateRequestDTO;
import project.office_workforce_service.model.entity.Department;
import project.office_workforce_service.service.manager.CompanyManagerService;
import project.office_workforce_service.service.manager.DepartmentManagerService;
import project.shared_office_starter.model.exception.PropertyValidationException;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

@Service
public class DepartmentCheckerService {

    private final DepartmentManagerService departmentManagerService;
    private final CompanyManagerService companyManagerService;

    @Autowired
    public DepartmentCheckerService(DepartmentManagerService departmentManagerService, CompanyManagerService companyManagerService) {
        this.departmentManagerService = departmentManagerService;
        this.companyManagerService = companyManagerService;
    }

    public void checkDepartmentIsActive(Department department) {
        if (department == null || !Boolean.TRUE.equals(department.getIsActive())) {
            throw new ResourceNotFoundException("Department not found or has been deactivated.");
        }
    }

    public void checkCreateRequest(DepartmentCreateRequestDTO dto) {
        if (dto == null) {
            throw new PropertyValidationException("Department creation payload cannot be null.");
        }
        if (dto.getCompanyId() == null) {
            throw new PropertyValidationException("Company ID is required.");
        }
        if (!companyManagerService.existsById(dto.getCompanyId())) {
            throw new ResourceNotFoundException("Company with ID " + dto.getCompanyId() + " does not exist.");
        }
        if (dto.getName() == null || dto.getName().isBlank()) {
            throw new PropertyValidationException("Department name cannot be blank.");
        }
        if (departmentManagerService.existsByCompanyIdAndNameIgnoreCase(dto.getCompanyId(), dto.getName().trim())) {
            throw new PropertyValidationException("Department with name '" + dto.getName() + "' already exists in this company.");
        }
    }

    public void checkUpdateRequest(Long currentId, DepartmentUpdateRequestDTO dto, Department existing) {
        if (dto == null) {
            throw new PropertyValidationException("Department update payload cannot be null.");
        }
        if (dto.getName() != null && !dto.getName().isBlank()) {
            Long companyId = existing.getCompany().getId();
            departmentManagerService.findByCompanyIdAndNameIgnoreCase(companyId, dto.getName().trim())
                .ifPresent(dep -> {
                    if (!dep.getId().equals(currentId)) {
                        throw new PropertyValidationException("Another department with name '" + dto.getName() + "' already exists in this company.");
                    }
                });
        }
    }
}
