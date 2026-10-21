package project.office_expenditure_service.service.manager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import project.office_expenditure_service.model.entity.Outcome;
import project.office_expenditure_service.repository.OutcomeRepository;
import project.office_expenditure_service.service.base.AbstractBaseService;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

import java.util.List;
import java.util.UUID;

@Service
public class OutcomeManagerService extends AbstractBaseService<Outcome, Long> {

    private final OutcomeRepository outcomeRepository;

    @Autowired
    public OutcomeManagerService(OutcomeRepository outcomeRepository) {
        super(outcomeRepository, "Outcome");
        this.outcomeRepository = outcomeRepository;
    }

    public Outcome findByUid(UUID uid) {
        return outcomeRepository.findByUid(uid)
            .orElseThrow(() -> new ResourceNotFoundException("Outcome not found by UID: " + uid));
    }

    public Page<Outcome> findBySubcategoryId(Long subcategoryId, Boolean isActive, Pageable pageable) {
        return outcomeRepository.findBySubcategoryId(subcategoryId, isActive, pageable);
    }

    public List<Outcome> findAllBySubcategoryId(Long subcategoryId, Boolean isActive) {
        return outcomeRepository.findAllBySubcategoryId(subcategoryId, isActive);
    }

    public Page<Outcome> findByCompanyId(Long companyId, Boolean isActive, Pageable pageable) {
        return outcomeRepository.findByCompanyId(companyId, isActive, pageable);
    }

    public Page<Outcome> search(Long companyId, Long subcategoryId, String q, Boolean isActive, Pageable pageable) {
        return outcomeRepository.search(companyId, subcategoryId, q, isActive, pageable);
    }
}
