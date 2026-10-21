package project.office_workforce_service.service.checker;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import project.office_workforce_service.model.dto.request.PlaceScheduleRuleCreateRequestDTO;
import project.office_workforce_service.model.dto.request.PlaceScheduleRuleUpdateRequestDTO;
import project.office_workforce_service.service.manager.PlaceManagerService;
import project.office_workforce_service.service.manager.PlaceScheduleRuleManagerService;
import project.shared_office_starter.model.exception.PropertyValidationException;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

@Service
public class PlaceScheduleRuleCheckerService {

    private final PlaceScheduleRuleManagerService ruleManagerService;
    private final PlaceManagerService placeManagerService;

    @Autowired
    public PlaceScheduleRuleCheckerService(
        PlaceScheduleRuleManagerService ruleManagerService,
        PlaceManagerService placeManagerService
    ) {
        this.ruleManagerService = ruleManagerService;
        this.placeManagerService = placeManagerService;
    }

    public void checkCreateRequest(PlaceScheduleRuleCreateRequestDTO dto) {
        if (dto == null) {
            throw new PropertyValidationException("Place schedule rule creation payload cannot be null.");
        }
        if (dto.getPlaceId() == null) {
            throw new PropertyValidationException("Place ID is required.");
        }
        if (!placeManagerService.existsById(dto.getPlaceId())) {
            throw new ResourceNotFoundException("Place with ID " + dto.getPlaceId() + " does not exist.");
        }
        if (ruleManagerService.existsByPlaceId(dto.getPlaceId())) {
            throw new PropertyValidationException("Schedule rule already exists for place ID " + dto.getPlaceId() + ".");
        }
    }

    public void checkUpdateRequest(PlaceScheduleRuleUpdateRequestDTO dto) {
        if (dto == null) {
            throw new PropertyValidationException("Place schedule rule update payload cannot be null.");
        }
    }
}
