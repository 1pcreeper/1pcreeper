package project.office_workforce_service.mapper;

import org.springframework.stereotype.Component;
import project.office_workforce_service.model.dto.request.DepartmentCreateRequestDTO;
import project.office_workforce_service.model.dto.request.DepartmentUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.DepartmentResponseDTO;
import project.office_workforce_service.model.entity.Company;
import project.office_workforce_service.model.entity.Department;

@Component
public class DepartmentMapper {

    public Department toEntity(DepartmentCreateRequestDTO request, Company company) {
        if (request == null) return null;

        return Department.builder()
            .company(company) // Passed in from the Service after validation
            .name(request.getName())
            .bio(request.getBio())
            .isActive(true)
            .build();
    }

    public void updateEntity(DepartmentUpdateRequestDTO request, Department entity) {
        if (request == null || entity == null) return;

        if (request.getName() != null) entity.setName(request.getName());
        if (request.getBio() != null) entity.setBio(request.getBio());
        entity.setIsActive(true);
    }

    public DepartmentResponseDTO toResponseDTO(Department department) {
        if (department == null) return null;

        return DepartmentResponseDTO.builder()
            .id(department.getId())
            .companyId(department.getCompany() != null ? department.getCompany().getId() : null)
            .name(department.getName())
            .bio(department.getBio())
            .isActive(department.getIsActive())
            .build();
    }
}