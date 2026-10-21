package project.office_workforce_service.service.manager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Service;
import project.office_workforce_service.model.entity.Company;
import project.office_workforce_service.model.entity.Staff;
import project.office_workforce_service.model.entity.enums.WorkType;
import project.office_workforce_service.repository.StaffRepository;
import project.office_workforce_service.service.base.AbstractBaseService;
import project.shared_office_starter.model.exception.PropertyValidationException;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

import java.util.List;

@Service
public class StaffManagerService extends AbstractBaseService<Staff, Long> {

    private final StaffRepository staffRepository;

    @Autowired
    public StaffManagerService(StaffRepository staffRepository) {
        super(staffRepository, "Staff");
        this.staffRepository = staffRepository;
    }

    public Page<Staff> searchStaff(String q, Long companyId, Long departId, WorkType workType, Boolean isActive, Pageable pageable) {
        return staffRepository.search(q, companyId, departId, workType, isActive, pageable);
    }

    @Override
    public Staff save(Staff staff) {
        if (staff.getCompany() == null || staff.getPerson() == null) {
            throw new PropertyValidationException("Staff must be associated with a valid Company and Person.");
        }
        return super.save(staff);
    }
    public Page<Staff> findAllByIsActive(@Param("isActive") Boolean isActive, Pageable pageable){
        return  staffRepository.findAllByIsActive(isActive,pageable);
    }
    
    public Page<Staff> findAllByCompanyIdAndIsActive( Long companyId, Boolean isActive, Pageable pageable){
        return staffRepository.findAllByCompanyIdAndIsActive(companyId,isActive,pageable);
    }

    public List<Staff> findByPersonId(Long personId){
        return staffRepository.findByPersonId(personId);
    }
    
    public Staff findByPersonIdAndCompanyId(Long personId, Long companyId){
        return staffRepository.findByPersonIdAndCompanyId(personId,companyId).orElseThrow(
            ()->new ResourceNotFoundException("Staff Not Found")
        );
    }

    public boolean existsByPersonIdAndCompanyId(Long personId, Long companyId) {
        return staffRepository.existsByPersonIdAndCompanyId(personId, companyId);
    }

    public boolean existsByCompanyIdAndCustIdIgnoreCase(Long companyId, String custId) {
        return staffRepository.existsByCompanyIdAndCustIdIgnoreCase(companyId, custId);
    }

    public java.util.Optional<Staff> findByCompanyIdAndCustIdIgnoreCase(Long companyId, String custId) {
        return staffRepository.findByCompanyIdAndCustIdIgnoreCase(companyId, custId);
    }

    public List<Staff> findActiveByDepartmentIdAndOccupationId(Long departId, Long occupationId) {
        return staffRepository.findActiveByDepartmentIdAndOccupationId(departId, occupationId);
    }
}