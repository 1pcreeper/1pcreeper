package project.office_workforce_service.service.checker;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import project.office_workforce_service.model.dto.request.ScheduleCreateRequestDTO;
import project.office_workforce_service.model.dto.request.ScheduleUpdateRequestDTO;
import project.office_workforce_service.model.entity.Schedule;
import project.office_workforce_service.model.entity.enums.ScheduleStatus;
import project.office_workforce_service.service.manager.PlaceManagerService;
import project.office_workforce_service.service.manager.OccupationManagerService;
import project.office_workforce_service.service.manager.ScheduleManagerService;
import project.office_workforce_service.service.manager.StaffManagerService;
import project.office_workforce_service.service.manager.WorkingPeriodManagerService;
import project.shared_office_starter.model.exception.PropertyValidationException;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ScheduleCheckerService {

    private static final DateTimeFormatter SHIFT_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private final PlaceManagerService placeManagerService;
    private final StaffManagerService staffManagerService;
    private final WorkingPeriodManagerService workingPeriodManagerService;
    private final OccupationManagerService occupationManagerService;
    private final ScheduleManagerService scheduleManagerService;

    @Autowired
    public ScheduleCheckerService(PlaceManagerService placeManagerService, StaffManagerService staffManagerService,
                                  WorkingPeriodManagerService workingPeriodManagerService,
                                  OccupationManagerService occupationManagerService,
                                  ScheduleManagerService scheduleManagerService) {
        this.placeManagerService = placeManagerService;
        this.staffManagerService = staffManagerService;
        this.workingPeriodManagerService = workingPeriodManagerService;
        this.occupationManagerService = occupationManagerService;
        this.scheduleManagerService = scheduleManagerService;
    }

    public void checkCreateRequest(ScheduleCreateRequestDTO dto) {
        if (dto == null) {
            throw new PropertyValidationException("Schedule creation payload cannot be null.");
        }
        if (dto.getPlaceId() == null) {
            throw new PropertyValidationException("Place ID is required.");
        }
        if (!placeManagerService.existsById(dto.getPlaceId())) {
            throw new ResourceNotFoundException("Place with ID " + dto.getPlaceId() + " does not exist.");
        }
        if (dto.getStaffId() == null) {
            throw new PropertyValidationException("Staff ID is required.");
        }
        if (!staffManagerService.existsById(dto.getStaffId())) {
            throw new ResourceNotFoundException("Staff with ID " + dto.getStaffId() + " does not exist.");
        }
        if (dto.getWorkingPeriodId() == null) {
            throw new PropertyValidationException("Working period is required.");
        }
        if (!workingPeriodManagerService.existsById(dto.getWorkingPeriodId())) {
            throw new ResourceNotFoundException("Working Period with ID " + dto.getWorkingPeriodId() + " does not exist.");
        }
        if (dto.getOccupationId() != null && !occupationManagerService.existsById(dto.getOccupationId())) {
            throw new ResourceNotFoundException("Occupation with ID " + dto.getOccupationId() + " does not exist.");
        }
        if (dto.getStartAt() == null || dto.getEndAt() == null) {
            throw new PropertyValidationException("Shift start time and end time are required.");
        }
        if (!dto.getEndAt().isAfter(dto.getStartAt())) {
            throw new PropertyValidationException("Shift end time must be after start time.");
        }
        checkNoConflict(dto.getStaffId(), dto.getPlaceId(), dto.getStartAt(), dto.getEndAt(), null);
    }

    public void checkUpdateRequest(ScheduleUpdateRequestDTO dto) {
        if (dto == null) {
            throw new PropertyValidationException("Schedule update payload cannot be null.");
        }
        if (dto.getPlaceId() != null && !placeManagerService.existsById(dto.getPlaceId())) {
            throw new ResourceNotFoundException("Place with ID " + dto.getPlaceId() + " does not exist.");
        }
        if (dto.getStaffId() != null && !staffManagerService.existsById(dto.getStaffId())) {
            throw new ResourceNotFoundException("Staff with ID " + dto.getStaffId() + " does not exist.");
        }
        if (dto.getWorkingPeriodId() != null && !workingPeriodManagerService.existsById(dto.getWorkingPeriodId())) {
            throw new ResourceNotFoundException("Working Period with ID " + dto.getWorkingPeriodId() + " does not exist.");
        }
        if (dto.getOccupationId() != null && !occupationManagerService.existsById(dto.getOccupationId())) {
            throw new ResourceNotFoundException("Occupation with ID " + dto.getOccupationId() + " does not exist.");
        }
        if (dto.getStartAt() != null && dto.getEndAt() != null) {
            if (!dto.getEndAt().isAfter(dto.getStartAt())) {
                throw new PropertyValidationException("Shift end time must be after start time.");
            }
        }
    }

    public void checkNoConflict(Long staffId, Long placeId, LocalDateTime startAt, LocalDateTime endAt, Long excludeId) {
        List<Schedule> conflicts = scheduleManagerService.findConflicts(
            staffId, placeId, startAt, endAt, ScheduleStatus.INACTIVE, excludeId);
        if (!conflicts.isEmpty()) {
            String details = conflicts.stream()
                .map(s -> "• " + s.getStartAt().format(SHIFT_FORMATTER) + " - "
                    + s.getEndAt().format(SHIFT_FORMATTER) + " (shift #" + s.getId() + ")")
                .collect(Collectors.joining("\n"));
            throw new PropertyValidationException("Staff is already registered at this place during:\n" + details);
        }
    }
}
