package project.office_expenditure_service.service.manager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import project.office_expenditure_service.model.entity.StaffSalary;
import project.office_expenditure_service.repository.StaffSalaryRepository;
import project.office_expenditure_service.service.base.AbstractBaseService;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class StaffSalaryManagerService extends AbstractBaseService<StaffSalary, Long> {

    private final StaffSalaryRepository staffSalaryRepository;

    @Autowired
    public StaffSalaryManagerService(StaffSalaryRepository staffSalaryRepository) {
        super(staffSalaryRepository, "StaffSalary");
        this.staffSalaryRepository = staffSalaryRepository;
    }

    public StaffSalary findByUid(UUID uid) {
        return staffSalaryRepository.findByUid(uid)
            .orElseThrow(() -> new ResourceNotFoundException("Staff salary not found by UID: " + uid));
    }

    public List<StaffSalary> findByStaffId(Long staffId, Boolean isActive) {
        return staffSalaryRepository.findByStaffId(staffId, isActive);
    }

    public Page<StaffSalary> findByStaffIdPaged(Long staffId, Boolean isActive, Pageable pageable) {
        return staffSalaryRepository.findByStaffIdPaged(staffId, isActive, pageable);
    }

    public Optional<StaffSalary> findLatestApprovedSalary(Long staffId) {
        return staffSalaryRepository.findLatestApprovedSalary(staffId);
    }
}
