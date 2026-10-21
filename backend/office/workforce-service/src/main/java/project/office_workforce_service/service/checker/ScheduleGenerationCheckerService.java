package project.office_workforce_service.service.checker;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import project.office_workforce_service.model.dto.request.ScheduleGenerationTriggerRequestDTO;
import project.office_workforce_service.service.manager.PlaceManagerService;
import project.shared_office_starter.model.exception.PropertyValidationException;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

@Service
public class ScheduleGenerationCheckerService {

    private final PlaceManagerService placeManagerService;

    @Autowired
    public ScheduleGenerationCheckerService(PlaceManagerService placeManagerService) {
        this.placeManagerService = placeManagerService;
    }


    public void checkTaskId(Long taskId) {
        if (taskId == null || taskId <= 0) {
            throw new PropertyValidationException("Task ID must be a positive integer.");
        }
    }

    public void checkTriggerRequest(ScheduleGenerationTriggerRequestDTO dto) {
        if (dto == null) {
            throw new PropertyValidationException("Schedule generation trigger payload cannot be null.");
        }
        if (dto.getPlaceId() == null) {
            throw new PropertyValidationException("Place ID is required.");
        }
        if (!placeManagerService.existsById(dto.getPlaceId())) {
            throw new ResourceNotFoundException("Place with ID " + dto.getPlaceId() + " does not exist.");
        }
        if (dto.getYear() == null || dto.getYear() < 2000) {
            throw new PropertyValidationException("Year must be 2000 or later.");
        }
        if (dto.getMonth() == null || dto.getMonth() < 1 || dto.getMonth() > 12) {
            throw new PropertyValidationException("Month must be between 1 and 12.");
        }
    }
}
