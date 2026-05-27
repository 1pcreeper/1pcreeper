package project.office_workforce_service.service.manager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import project.office_workforce_service.model.entity.PlaceScheduleRule;
import project.office_workforce_service.repository.PlaceScheduleRuleRepository;
import project.office_workforce_service.service.base.AbstractBaseService;
import project.shared_office_starter.model.exception.PropertyValidationException;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

@Service
public class PlaceScheduleRuleManagerService extends AbstractBaseService<PlaceScheduleRule, Long> {

    private final PlaceScheduleRuleRepository placeScheduleRuleRepository;

    @Autowired
    public PlaceScheduleRuleManagerService(PlaceScheduleRuleRepository placeScheduleRuleRepository) {
        super(placeScheduleRuleRepository, "PlaceScheduleRule");
        this.placeScheduleRuleRepository = placeScheduleRuleRepository;
    }

    public PlaceScheduleRule findByPlaceId(Long placeId) {
        return placeScheduleRuleRepository.findByPlaceId(placeId)
            .orElseThrow(() -> new ResourceNotFoundException("PlaceScheduleRule not found for place id: " + placeId));
    }

    @Override
    public PlaceScheduleRule save(PlaceScheduleRule entity) {
        if (entity.getPersonCount() == null || entity.getPersonCount() <= 0) {
            throw new PropertyValidationException("Person count required for place must be greater than zero.");
        }
        return super.save(entity);
    }
}