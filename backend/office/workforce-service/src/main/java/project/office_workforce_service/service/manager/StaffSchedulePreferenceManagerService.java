package project.office_workforce_service.service.manager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import project.office_workforce_service.model.entity.StaffSchedulePreference;
import project.office_workforce_service.repository.StaffSchedulePreferenceRepository;
import project.office_workforce_service.service.base.AbstractBaseService;
import project.shared_office_starter.model.exception.PropertyValidationException;

@Service
public class StaffSchedulePreferenceManagerService extends AbstractBaseService<StaffSchedulePreference, Long> {

    private final StaffSchedulePreferenceRepository preferenceRepository;

    @Autowired
    public StaffSchedulePreferenceManagerService(StaffSchedulePreferenceRepository preferenceRepository) {
        super(preferenceRepository, "StaffSchedulePreference");
        this.preferenceRepository = preferenceRepository;
    }

    public Page<StaffSchedulePreference> search(Long staffId, Long placeId, Integer weekDay, Pageable pageable) {
        if (weekDay != null && (weekDay < 1 || weekDay > 7)) {
            throw new PropertyValidationException("Weekday must be between 1 and 7.");
        }
        return preferenceRepository.search(staffId, placeId, weekDay, pageable);
    }
}