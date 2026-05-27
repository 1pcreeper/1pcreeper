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
}