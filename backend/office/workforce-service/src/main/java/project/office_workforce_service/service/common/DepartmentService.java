package project.office_workforce_service.service.common;

import jakarta.annotation.Nullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.office_workforce_service.mapper.DepartmentMapper;
import project.office_workforce_service.model.dto.request.DepartmentCreateRequestDTO;
import project.office_workforce_service.model.dto.request.DepartmentUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.DepartmentResponseDTO;
import project.office_workforce_service.model.entity.Company;
import project.office_workforce_service.model.entity.Department;
import project.office_workforce_service.service.checker.DepartmentCheckerService;
import project.office_workforce_service.service.manager.CompanyManagerService;
import project.office_workforce_service.service.manager.DepartmentManagerService;
import project.shared_office_starter.mapper.PaginationMapper;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

@Service
public class DepartmentService {

    @Autowired
    private DepartmentManagerService departmentManagerService;

    @Autowired
    private CompanyManagerService companyManagerService;

    @Autowired
    private DepartmentCheckerService departmentCheckerService;

    @Autowired
    private DepartmentMapper departmentMapper;

    @Autowired
    private PaginationMapper paginationMapper;

    public PaginationBaseResponseDTO<DepartmentResponseDTO> search(
        @Nullable Long companyId,
        @Nullable String q,
        @Nullable Boolean isActive,
        Pageable pageable) {

        return paginationMapper.toDTO(
            departmentManagerService.search(companyId, q, isActive, pageable),
            departmentMapper::toResponseDTO
        );
    }

    public DepartmentResponseDTO findById(Long id) {
        Department existingOrg = departmentManagerService.findById(id);
        departmentCheckerService.checkDepartmentIsActive(existingOrg);
        return departmentMapper.toResponseDTO(existingOrg);
    }

    @Transactional
    public DepartmentResponseDTO create(DepartmentCreateRequestDTO requestDTO) {
        departmentCheckerService.checkCreateRequest(requestDTO);
        Company company = companyManagerService.getReferenceById(requestDTO.getCompanyId());

        Department newOrg = departmentMapper.toEntity(requestDTO, company);
        return departmentMapper.toResponseDTO(departmentManagerService.save(newOrg));
    }

    @Transactional
    public DepartmentResponseDTO update(Long id, DepartmentUpdateRequestDTO requestDTO) {
        Department existingOrg = departmentManagerService.findById(id);
        departmentCheckerService.checkDepartmentIsActive(existingOrg);
        departmentCheckerService.checkUpdateRequest(id, requestDTO, existingOrg);
        departmentMapper.updateEntity(requestDTO, existingOrg);

        return departmentMapper.toResponseDTO(departmentManagerService.save(existingOrg));
    }
    
    public PaginationBaseResponseDTO<DepartmentResponseDTO> findAll(
        Pageable pageable,
        @Nullable Long companyId
    ){
        Page<Department> departments = companyId != null ?
            departmentManagerService.findAllByCompanyIdAndIsActive(companyId, true, pageable)
            : departmentManagerService.findAllByIsActive(true, pageable);
        return paginationMapper.toDTO(departments,
            org-> departmentMapper.toResponseDTO(org)
        );
    }
    @Transactional
    public void delete(Long id){
        Department existingOrg = departmentManagerService.findById(id);
        departmentCheckerService.checkDepartmentIsActive(existingOrg);
        existingOrg.setIsActive(false);
        departmentManagerService.save(existingOrg);
    }
}