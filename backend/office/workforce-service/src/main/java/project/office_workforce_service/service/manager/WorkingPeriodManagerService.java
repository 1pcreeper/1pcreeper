package project.office_workforce_service.service.manager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import project.office_workforce_service.model.entity.WorkingPeriod;
import project.office_workforce_service.repository.WorkingPeriodRepository;
import project.office_workforce_service.service.base.AbstractBaseService;
import project.shared_office_starter.model.exception.PropertyValidationException;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

import java.time.LocalTime;

@Service
public class WorkingPeriodManagerService extends AbstractBaseService<WorkingPeriod, Long> {

    private final WorkingPeriodRepository workingPeriodRepository;

    @Autowired
    public WorkingPeriodManagerService(WorkingPeriodRepository workingPeriodRepository) {
        super(workingPeriodRepository, "WorkingPeriod");
        this.workingPeriodRepository = workingPeriodRepository;
    }

    public Page<WorkingPeriod> search(Long departId, String q, LocalTime startFrom, LocalTime endTo, Boolean isActive, Pageable pageable) {
        return workingPeriodRepository.search(departId, q, startFrom, endTo, isActive, pageable);
    }
    
    public WorkingPeriod findByRangeAndDepartId(Long departId, LocalTime startAt, LocalTime endAt){
        return workingPeriodRepository.findByRangeAndDepartId(departId, startAt, endAt).orElseThrow(
            () -> new ResourceNotFoundException("Period Not Found")
        );
    }

    @Override
    public WorkingPeriod save(WorkingPeriod entity) {
        if (entity.getStartAt() != null && entity.getEndAt() != null && entity.getStartAt().isAfter(entity.getEndAt())) {
            throw new PropertyValidationException("Working period start time cannot be after end time.");
        }
        return super.save(entity);
    }
}