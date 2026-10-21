package project.office_workforce_service.service.checker;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import project.office_workforce_service.model.dto.request.StaffSchedulePreferenceCreateRequestDTO;
import project.office_workforce_service.model.dto.request.StaffSchedulePreferenceUpdateRequestDTO;
import project.office_workforce_service.service.manager.PlaceManagerService;
import project.office_workforce_service.service.manager.StaffManagerService;
import project.office_workforce_service.service.manager.StaffSchedulePreferenceManagerService;
import project.office_workforce_service.service.manager.WorkingPeriodManagerService;
import project.shared_office_starter.model.exception.PropertyValidationException;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

@Service
public class StaffSchedulePreferenceCheckerService {

    private final StaffSchedulePreferenceManagerService preferenceManagerService;
    private final StaffManagerService staffManagerService;
    private final PlaceManagerService placeManagerService;
    private final WorkingPeriodManagerService workingPeriodManagerService;

    @Autowired
    public StaffSchedulePreferenceCheckerService(
        StaffSchedulePreferenceManagerService preferenceManagerService,
        StaffManagerService staffManagerService,
        PlaceManagerService placeManagerService,
        WorkingPeriodManagerService workingPeriodManagerService
    ) {
        this.preferenceManagerService = preferenceManagerService;
        this.staffManagerService = staffManagerService;
        this.placeManagerService = placeManagerService;
        this.workingPeriodManagerService = workingPeriodManagerService;
    }

    public void checkCreateRequest(StaffSchedulePreferenceCreateRequestDTO dto) {
        if (dto == null) {
            throw new PropertyValidationException("Schedule preference payload cannot be null.");
        }
        if (dto.getStaffId() == null) {
            throw new PropertyValidationException("Staff ID is required.");
        }
        if (!staffManagerService.existsById(dto.getStaffId())) {
            throw new ResourceNotFoundException("Staff with ID " + dto.getStaffId() + " does not exist.");
        }
        if (dto.getPlaceId() == null) {
            throw new PropertyValidationException("Place ID is required.");
        }
        if (!placeManagerService.existsById(dto.getPlaceId())) {
            throw new ResourceNotFoundException("Place with ID " + dto.getPlaceId() + " does not exist.");
        }
        if (dto.getWorkingPeriodId() == null) {
            throw new PropertyValidationException("Working Period ID is required.");
        }
        if (!workingPeriodManagerService.existsById(dto.getWorkingPeriodId())) {
            throw new ResourceNotFoundException("Working Period with ID " + dto.getWorkingPeriodId() + " does not exist.");
        }
        if (dto.getWeekDay() == null || dto.getWeekDay() < 1 || dto.getWeekDay() > 7) {
            throw new PropertyValidationException("Weekday must be between 1 (Monday) and 7 (Sunday).");
        }
        if (preferenceManagerService.existsByStaffIdAndPlaceIdAndWeekDay(
            dto.getStaffId(), dto.getPlaceId(), dto.getWeekDay())) {
            throw new PropertyValidationException("Staff schedule preference for this place and weekday already exists.");
        }
    }

    public void checkUpdateRequest(StaffSchedulePreferenceUpdateRequestDTO dto) {
        if (dto == null) {
            throw new PropertyValidationException("Schedule preference update payload cannot be null.");
        }
        if (dto.getWeekDay() != null && (dto.getWeekDay() < 1 || dto.getWeekDay() > 7)) {
            throw new PropertyValidationException("Weekday must be between 1 (Monday) and 7 (Sunday).");
        }
        if (dto.getWorkingPeriodId() != null && !workingPeriodManagerService.existsById(dto.getWorkingPeriodId())) {
            throw new ResourceNotFoundException("Working Period with ID " + dto.getWorkingPeriodId() + " does not exist.");
        }
    }
}
