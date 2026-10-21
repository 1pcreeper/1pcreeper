package project.office_workforce_service.service.manager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import project.office_workforce_service.model.entity.Schedule;
import project.office_workforce_service.model.entity.enums.ScheduleStatus;
import project.office_workforce_service.repository.ScheduleRepository;
import project.office_workforce_service.service.base.AbstractBaseService;
import project.shared_office_starter.model.exception.PropertyValidationException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ScheduleManagerService extends AbstractBaseService<Schedule, Long> {

    private final ScheduleRepository scheduleRepository;

    @Autowired
    public ScheduleManagerService(ScheduleRepository scheduleRepository) {
        super(scheduleRepository, "Schedule");
        this.scheduleRepository = scheduleRepository;
    }

    public Page<Schedule> search(Long placeId, Long staffId, ScheduleStatus status,
                                          LocalDateTime startFrom, LocalDateTime endTo, Pageable pageable) {
        if (startFrom != null && endTo != null && startFrom.isAfter(endTo)) {
            throw new PropertyValidationException("Start time cannot be after end time.");
        }
        return scheduleRepository.search(placeId, staffId, status, startFrom, endTo, pageable);
    }

    public List<Schedule> findConflicts(Long staffId, Long placeId, LocalDateTime startAt,
                                        LocalDateTime endAt, ScheduleStatus excludedStatus, Long excludeId) {
        return scheduleRepository.findConflicts(staffId, placeId, startAt, endAt, excludedStatus, excludeId);
    }

    public long countSlotOccupancy(Long placeId, Long occupationId, Long workingPeriodId,
                                   LocalDateTime dayStart, LocalDateTime dayEnd, ScheduleStatus excludedStatus) {
        return scheduleRepository.countSlotOccupancy(placeId, occupationId, workingPeriodId, dayStart, dayEnd, excludedStatus);
    }
}