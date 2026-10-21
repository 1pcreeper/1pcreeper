package project.office_expenditure_service.service.manager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import project.office_expenditure_service.model.entity.OutcomeCategory;
import project.office_expenditure_service.repository.OutcomeCategoryRepository;
import project.office_expenditure_service.service.base.AbstractBaseService;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

import java.util.List;
import java.util.UUID;

@Service
public class OutcomeCategoryManagerService extends AbstractBaseService<OutcomeCategory, Long> {

    private final OutcomeCategoryRepository outcomeCategoryRepository;

    @Autowired
    public OutcomeCategoryManagerService(OutcomeCategoryRepository outcomeCategoryRepository) {
        super(outcomeCategoryRepository, "OutcomeCategory");
        this.outcomeCategoryRepository = outcomeCategoryRepository;
    }

    public OutcomeCategory findByUid(UUID uid) {
        return outcomeCategoryRepository.findByUid(uid)
            .orElseThrow(() -> new ResourceNotFoundException("Outcome category not found by UID: " + uid));
    }

    public Page<OutcomeCategory> findByCompanyId(Long companyId, Boolean isActive, Pageable pageable) {
        return outcomeCategoryRepository.findByCompanyId(companyId, isActive, pageable);
    }

    public List<OutcomeCategory> findAllByCompanyId(Long companyId, Boolean isActive) {
        return outcomeCategoryRepository.findAllByCompanyId(companyId, isActive);
    }

    public Page<OutcomeCategory> search(Long companyId, String q, Boolean isActive, Pageable pageable) {
        return outcomeCategoryRepository.search(companyId, q, isActive, pageable);
    }
}
