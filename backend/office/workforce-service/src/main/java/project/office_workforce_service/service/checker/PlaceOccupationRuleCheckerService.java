package project.office_workforce_service.service.checker;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import project.office_workforce_service.model.dto.request.PlaceOccupationRuleCreateRequestDTO;
import project.office_workforce_service.model.dto.request.PlaceOccupationRuleUpdateRequestDTO;
import project.office_workforce_service.model.entity.PlaceOccupationRule;
import project.office_workforce_service.service.manager.OccupationManagerService;
import project.office_workforce_service.service.manager.PlaceManagerService;
import project.office_workforce_service.service.manager.PlaceOccupationRuleManagerService;
import project.shared_office_starter.model.exception.PropertyValidationException;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

@Service
public class PlaceOccupationRuleCheckerService {

    private final PlaceOccupationRuleManagerService ruleManagerService;
    private final PlaceManagerService placeManagerService;
    private final OccupationManagerService occupationManagerService;

    @Autowired
    public PlaceOccupationRuleCheckerService(
        PlaceOccupationRuleManagerService ruleManagerService,
        PlaceManagerService placeManagerService,
        OccupationManagerService occupationManagerService
    ) {
        this.ruleManagerService = ruleManagerService;
        this.placeManagerService = placeManagerService;
        this.occupationManagerService = occupationManagerService;
    }

    public void checkCreateRequest(PlaceOccupationRuleCreateRequestDTO dto) {
        if (dto == null) {
            throw new PropertyValidationException("Place occupation rule creation payload cannot be null.");
        }
        if (dto.getPlaceId() == null) {
            throw new PropertyValidationException("Place ID is required.");
        }
        if (!placeManagerService.existsById(dto.getPlaceId())) {
            throw new ResourceNotFoundException("Place with ID " + dto.getPlaceId() + " does not exist.");
        }
        checkWeekDay(dto.getWeekDay());
        if (dto.getOccupationId() == null) {
            throw new PropertyValidationException("Occupation ID is required.");
        }
        if (!occupationManagerService.existsById(dto.getOccupationId())) {
            throw new ResourceNotFoundException("Occupation with ID " + dto.getOccupationId() + " does not exist.");
        }
        if (ruleManagerService.existsByPlaceIdAndWeekDayAndOccupationId(dto.getPlaceId(), dto.getWeekDay(), dto.getOccupationId())) {
            throw new PropertyValidationException("Rule for this place, week day and occupation already exists.");
        }
    }

    public void checkUpdateRequest(PlaceOccupationRuleUpdateRequestDTO dto, PlaceOccupationRule existing) {
        if (dto == null) {
            throw new PropertyValidationException("Place occupation rule update payload cannot be null.");
        }
        if (dto.getWeekDay() != null) {
            checkWeekDay(dto.getWeekDay());
            ruleManagerService.findByPlaceIdAndWeekDayAndOccupationId(
                    existing.getPlace().getId(), dto.getWeekDay(), existing.getOccupation().getId())
                .filter(conflict -> !conflict.getId().equals(existing.getId()))
                .ifPresent(conflict -> {
                    throw new PropertyValidationException("Rule for this place, week day and occupation already exists.");
                });
        }
    }

    private void checkWeekDay(Integer weekDay) {
        if (weekDay == null) {
            throw new PropertyValidationException("Week day is required.");
        }
        if (weekDay < 1 || weekDay > 7) {
            throw new PropertyValidationException("Week day must be between 1 and 7.");
        }
    }
}
