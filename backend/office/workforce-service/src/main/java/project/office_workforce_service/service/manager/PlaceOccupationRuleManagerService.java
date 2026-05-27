package project.office_workforce_service.service.manager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import project.office_workforce_service.model.entity.PlaceOccupationRule;
import project.office_workforce_service.repository.PlaceOccupationRuleRepository;
import project.office_workforce_service.service.base.AbstractBaseService;
import project.shared_office_starter.model.exception.PropertyValidationException;

@Service
public class PlaceOccupationRuleManagerService extends AbstractBaseService<PlaceOccupationRule, Long> {

    private final PlaceOccupationRuleRepository ruleRepository;

    @Autowired
    public PlaceOccupationRuleManagerService(PlaceOccupationRuleRepository ruleRepository) {
        super(ruleRepository, "PlaceOccupationRule");
        this.ruleRepository = ruleRepository;
    }

    public Page<PlaceOccupationRule> search(Long placeId, Long occupationId, Pageable pageable) {
        return ruleRepository.search(placeId, occupationId, pageable);
    }

    @Override
    public PlaceOccupationRule save(PlaceOccupationRule entity) {
        if (entity.getPersonCount() == null || entity.getPersonCount() < 0) {
            throw new PropertyValidationException("Person count must be zero or greater.");
        }
        return super.save(entity);
    }
}