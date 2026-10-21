package project.office_workforce_service.service.manager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import project.office_workforce_service.model.entity.PlaceWorkingPeriodRule;
import project.office_workforce_service.repository.PlaceWorkingPeriodRuleRepository;
import project.office_workforce_service.service.base.AbstractBaseService;
import project.shared_office_starter.model.exception.PropertyValidationException;

import java.util.List;

@Service
public class PlaceWorkingPeriodRuleManagerService extends AbstractBaseService<PlaceWorkingPeriodRule, Long> {

    private final PlaceWorkingPeriodRuleRepository ruleRepository;

    @Autowired
    public PlaceWorkingPeriodRuleManagerService(PlaceWorkingPeriodRuleRepository ruleRepository) {
        super(ruleRepository, "PlaceWorkingPeriodRule");
        this.ruleRepository = ruleRepository;
    }

    public Page<PlaceWorkingPeriodRule> search(Long occupationRuleId, Long workingPeriodId, Pageable pageable) {
        return ruleRepository.search(occupationRuleId, workingPeriodId, pageable);
    }

    @Override
    public PlaceWorkingPeriodRule save(PlaceWorkingPeriodRule entity) {
        if (entity.getPersonCount() == null || entity.getPersonCount() < 0) {
            throw new PropertyValidationException("Person count must be zero or greater.");
        }
        return super.save(entity);
    }

    public List<PlaceWorkingPeriodRule> findByOccupationRuleId(Long occupationRuleId) {
        return ruleRepository.findByOccupationRuleId(occupationRuleId);
    }

    public boolean existsByOccupationRuleIdAndWorkingPeriodId(Long occupationRuleId, Long workingPeriodId) {
        return ruleRepository.existsByOccupationRuleIdAndWorkingPeriodId(occupationRuleId, workingPeriodId);
    }
}
