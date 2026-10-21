package project.office_expenditure_service.service.manager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import project.office_expenditure_service.model.entity.StaffSalaryExpense;
import project.office_expenditure_service.model.entity.enums.IntervalPeriod;
import project.office_expenditure_service.repository.StaffSalaryExpenseRepository;
import project.office_expenditure_service.service.base.AbstractBaseService;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class StaffSalaryExpenseManagerService extends AbstractBaseService<StaffSalaryExpense, Long> {

    private final StaffSalaryExpenseRepository staffSalaryExpenseRepository;

    @Autowired
    public StaffSalaryExpenseManagerService(StaffSalaryExpenseRepository staffSalaryExpenseRepository) {
        super(staffSalaryExpenseRepository, "StaffSalaryExpense");
        this.staffSalaryExpenseRepository = staffSalaryExpenseRepository;
    }

    public StaffSalaryExpense findByUid(UUID uid) {
        return staffSalaryExpenseRepository.findByUid(uid)
            .orElseThrow(() -> new ResourceNotFoundException("Staff salary expense not found by UID: " + uid));
    }

    public Page<StaffSalaryExpense> findByCompanyId(Long companyId, Boolean isActive, Pageable pageable) {
        return staffSalaryExpenseRepository.findByCompanyId(companyId, isActive, pageable);
    }

    public List<StaffSalaryExpense> findByStaffSalaryId(Long staffSalaryId, Boolean isActive) {
        return staffSalaryExpenseRepository.findByStaffSalaryId(staffSalaryId, isActive);
    }

    public Page<StaffSalaryExpense> search(Long companyId, IntervalPeriod period, LocalDateTime fromTime,
                                           LocalDateTime toTime, String q, Boolean isActive, Pageable pageable) {
        return staffSalaryExpenseRepository.search(companyId, period, fromTime, toTime, q, isActive, pageable);
    }
}
