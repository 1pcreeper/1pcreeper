package project.office_workforce_service.service.manager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import project.office_workforce_service.model.entity.Department;
import project.office_workforce_service.repository.DepartmentRepository;
import project.office_workforce_service.service.base.AbstractBaseService;

@Service
public class DepartmentManagerService extends AbstractBaseService<Department, Long> {

    private final DepartmentRepository departmentRepository;

    @Autowired
    public DepartmentManagerService(DepartmentRepository departmentRepository) {
        super(departmentRepository, "Department");
        this.departmentRepository = departmentRepository;
    }

    public Page<Department> search(Long companyId, String q, Boolean isActive, Pageable pageable) {
        return departmentRepository.search(companyId, q, isActive, pageable);
    }
    
    public Page<Department> findAllByIsActive(Boolean isActive, Pageable pageable){
        return departmentRepository.findAllByIsActive(isActive,pageable);
    }
    
    public Page<Department> findAllByCompanyIdAndIsActive(Long companyId, Boolean isActive, Pageable pageable){
        return  departmentRepository.findAllByCompanyIdAndIsActive(companyId,isActive,pageable);
    }

    public boolean existsByCompanyIdAndNameIgnoreCase(Long companyId, String name) {
        return departmentRepository.existsByCompanyIdAndNameIgnoreCase(companyId, name);
    }

    public java.util.Optional<Department> findByCompanyIdAndNameIgnoreCase(Long companyId, String name) {
        return departmentRepository.findByCompanyIdAndNameIgnoreCase(companyId, name);
    }
}