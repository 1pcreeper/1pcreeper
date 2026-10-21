package project.office_workforce_service.service.checker;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import project.office_workforce_service.model.dto.request.PlaceWorkingPeriodRuleCreateRequestDTO;
import project.office_workforce_service.model.dto.request.PlaceWorkingPeriodRuleUpdateRequestDTO;
import project.office_workforce_service.service.manager.PlaceOccupationRuleManagerService;
import project.office_workforce_service.service.manager.PlaceWorkingPeriodRuleManagerService;
import project.office_workforce_service.service.manager.WorkingPeriodManagerService;
import project.shared_office_starter.model.exception.PropertyValidationException;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

@Service
public class PlaceWorkingPeriodRuleCheckerService {

    private final PlaceWorkingPeriodRuleManagerService ruleManagerService;
    private final PlaceOccupationRuleManagerService occupationRuleManagerService;
    private final WorkingPeriodManagerService workingPeriodManagerService;

    @Autowired
    public PlaceWorkingPeriodRuleCheckerService(
        PlaceWorkingPeriodRuleManagerService ruleManagerService,
        PlaceOccupationRuleManagerService occupationRuleManagerService,
        WorkingPeriodManagerService workingPeriodManagerService
    ) {
        this.ruleManagerService = ruleManagerService;
        this.occupationRuleManagerService = occupationRuleManagerService;
        this.workingPeriodManagerService = workingPeriodManagerService;
    }

    public void checkCreateRequest(PlaceWorkingPeriodRuleCreateRequestDTO dto) {
        if (dto == null) {
            throw new PropertyValidationException("Place working period rule creation payload cannot be null.");
        }
        if (dto.getOccupationRuleId() == null) {
            throw new PropertyValidationException("Occupation rule ID is required.");
        }
        if (!occupationRuleManagerService.existsById(dto.getOccupationRuleId())) {
            throw new ResourceNotFoundException("Place Occupation Rule with ID " + dto.getOccupationRuleId() + " does not exist.");
        }
        if (dto.getWorkingPeriodId() == null) {
            throw new PropertyValidationException("Working Period ID is required.");
        }
        if (!workingPeriodManagerService.existsById(dto.getWorkingPeriodId())) {
            throw new ResourceNotFoundException("Working Period with ID " + dto.getWorkingPeriodId() + " does not exist.");
        }
        if (ruleManagerService.existsByOccupationRuleIdAndWorkingPeriodId(dto.getOccupationRuleId(), dto.getWorkingPeriodId())) {
            throw new PropertyValidationException("Rule for this occupation rule and working period already exists.");
        }
        if (dto.getPersonCount() < 0) {
            throw new PropertyValidationException("Person count cannot be negative.");
        }
    }

    public void checkUpdateRequest(PlaceWorkingPeriodRuleUpdateRequestDTO dto) {
        if (dto == null) {
            throw new PropertyValidationException("Place working period rule update payload cannot be null.");
        }
        if (dto.getPersonCount() != null && dto.getPersonCount() < 0) {
            throw new PropertyValidationException("Person count cannot be negative.");
        }
    }
}
