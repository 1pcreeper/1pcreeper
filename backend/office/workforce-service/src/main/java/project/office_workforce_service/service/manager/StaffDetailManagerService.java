package project.office_workforce_service.service.manager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import project.office_workforce_service.model.entity.StaffDetail;
import project.office_workforce_service.repository.StaffDetailRepository;
import project.office_workforce_service.service.base.AbstractBaseService;
import project.shared_office_starter.model.exception.PropertyValidationException;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

@Service
public class StaffDetailManagerService extends AbstractBaseService<StaffDetail, Long> {

    private final StaffDetailRepository staffDetailRepository;

    @Autowired
    public StaffDetailManagerService(StaffDetailRepository staffDetailRepository) {
        super(staffDetailRepository, "StaffDetail");
        this.staffDetailRepository = staffDetailRepository;
    }

    public StaffDetail findByStaffId(Long staffId) {
        return staffDetailRepository.findByStaffId(staffId)
            .orElseThrow(() -> new ResourceNotFoundException("StaffDetail not found for staff id: " + staffId));
    }

    @Override
    public StaffDetail save(StaffDetail entity) {
        if (entity.getMaxWorkingHrs() == null || entity.getMaxWorkingHrs() <= 0) {
            throw new PropertyValidationException("Max working hours must be greater than zero.");
        }
        return super.save(entity);
    }
}