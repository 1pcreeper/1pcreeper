package project.office_workforce_service.service.manager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import project.office_workforce_service.model.entity.PlaceOccupationRule;
import project.office_workforce_service.repository.PlaceOccupationRuleRepository;
import project.office_workforce_service.service.base.AbstractBaseService;
import project.shared_office_starter.model.exception.PropertyValidationException;

import java.util.List;
import java.util.Optional;

@Service
public class PlaceOccupationRuleManagerService extends AbstractBaseService<PlaceOccupationRule, Long> {

    private final PlaceOccupationRuleRepository ruleRepository;

    @Autowired
    public PlaceOccupationRuleManagerService(PlaceOccupationRuleRepository ruleRepository) {
        super(ruleRepository, "PlaceOccupationRule");
        this.ruleRepository = ruleRepository;
    }

    public Page<PlaceOccupationRule> search(Long placeId, Integer weekDay, Long occupationId, Pageable pageable) {
        return ruleRepository.search(placeId, weekDay, occupationId, pageable);
    }

    @Override
    public PlaceOccupationRule save(PlaceOccupationRule entity) {
        if (entity.getWeekDay() == null || entity.getWeekDay() < 1 || entity.getWeekDay() > 7) {
            throw new PropertyValidationException("Weekday must be between 1 and 7.");
        }
        return super.save(entity);
    }

    public List<PlaceOccupationRule> findByPlaceIdAndWeekDay(Long placeId, Integer weekDay) {
        return ruleRepository.findByPlaceIdAndWeekDay(placeId, weekDay);
    }

    public boolean existsByPlaceIdAndWeekDayAndOccupationId(Long placeId, Integer weekDay, Long occupationId) {
        return ruleRepository.existsByPlaceIdAndWeekDayAndOccupationId(placeId, weekDay, occupationId);
    }

    public Optional<PlaceOccupationRule> findByPlaceIdAndWeekDayAndOccupationId(Long placeId, Integer weekDay, Long occupationId) {
        return ruleRepository.findByPlaceIdAndWeekDayAndOccupationId(placeId, weekDay, occupationId);
    }
}
