package project.office_expenditure_service.service.manager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import project.office_expenditure_service.model.entity.OutcomeExpense;
import project.office_expenditure_service.model.entity.enums.IntervalPeriod;
import project.office_expenditure_service.repository.OutcomeExpenseRepository;
import project.office_expenditure_service.service.base.AbstractBaseService;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class OutcomeExpenseManagerService extends AbstractBaseService<OutcomeExpense, Long> {

    private final OutcomeExpenseRepository outcomeExpenseRepository;

    @Autowired
    public OutcomeExpenseManagerService(OutcomeExpenseRepository outcomeExpenseRepository) {
        super(outcomeExpenseRepository, "OutcomeExpense");
        this.outcomeExpenseRepository = outcomeExpenseRepository;
    }

    public OutcomeExpense findByUid(UUID uid) {
        return outcomeExpenseRepository.findByUid(uid)
            .orElseThrow(() -> new ResourceNotFoundException("Outcome expense not found by UID: " + uid));
    }

    public Page<OutcomeExpense> findByCompanyId(Long companyId, Boolean isActive, Pageable pageable) {
        return outcomeExpenseRepository.findByCompanyId(companyId, isActive, pageable);
    }

    public List<OutcomeExpense> findByOutcomeId(Long outcomeId, Boolean isActive) {
        return outcomeExpenseRepository.findByOutcomeId(outcomeId, isActive);
    }

    public Page<OutcomeExpense> search(Long companyId, IntervalPeriod period, LocalDateTime fromTime,
                                       LocalDateTime toTime, String q, Boolean isActive, Pageable pageable) {
        return outcomeExpenseRepository.search(companyId, period, fromTime, toTime, q, isActive, pageable);
    }
}
