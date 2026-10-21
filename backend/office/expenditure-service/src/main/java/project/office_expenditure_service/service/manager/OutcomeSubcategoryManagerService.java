package project.office_expenditure_service.service.manager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import project.office_expenditure_service.model.entity.OutcomeSubcategory;
import project.office_expenditure_service.repository.OutcomeSubcategoryRepository;
import project.office_expenditure_service.service.base.AbstractBaseService;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

import java.util.List;
import java.util.UUID;

@Service
public class OutcomeSubcategoryManagerService extends AbstractBaseService<OutcomeSubcategory, Long> {

    private final OutcomeSubcategoryRepository outcomeSubcategoryRepository;

    @Autowired
    public OutcomeSubcategoryManagerService(OutcomeSubcategoryRepository outcomeSubcategoryRepository) {
        super(outcomeSubcategoryRepository, "OutcomeSubcategory");
        this.outcomeSubcategoryRepository = outcomeSubcategoryRepository;
    }

    public OutcomeSubcategory findByUid(UUID uid) {
        return outcomeSubcategoryRepository.findByUid(uid)
            .orElseThrow(() -> new ResourceNotFoundException("Outcome subcategory not found by UID: " + uid));
    }

    public Page<OutcomeSubcategory> findByCategoryId(Long categoryId, Boolean isActive, Pageable pageable) {
        return outcomeSubcategoryRepository.findByCategoryId(categoryId, isActive, pageable);
    }

    public List<OutcomeSubcategory> findAllByCategoryId(Long categoryId, Boolean isActive) {
        return outcomeSubcategoryRepository.findAllByCategoryId(categoryId, isActive);
    }

    public Page<OutcomeSubcategory> findByCompanyId(Long companyId, Boolean isActive, Pageable pageable) {
        return outcomeSubcategoryRepository.findByCompanyId(companyId, isActive, pageable);
    }

    public Page<OutcomeSubcategory> search(Long companyId, Long categoryId, String q, Boolean isActive, Pageable pageable) {
        return outcomeSubcategoryRepository.search(companyId, categoryId, q, isActive, pageable);
    }
}
