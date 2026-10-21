package project.office_workforce_service.service.checker;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import project.office_workforce_service.model.dto.request.WorkingPeriodCreateRequestDTO;
import project.office_workforce_service.model.dto.request.WorkingPeriodUpdateRequestDTO;
import project.office_workforce_service.model.entity.WorkingPeriod;
import project.office_workforce_service.service.manager.DepartmentManagerService;
import project.office_workforce_service.service.manager.WorkingPeriodManagerService;
import project.shared_office_starter.model.exception.PropertyValidationException;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

@Service
public class WorkingPeriodCheckerService {

    private final WorkingPeriodManagerService workingPeriodManagerService;
    private final DepartmentManagerService departmentManagerService;

    @Autowired
    public WorkingPeriodCheckerService(
        WorkingPeriodManagerService workingPeriodManagerService,
        DepartmentManagerService departmentManagerService
    ) {
        this.workingPeriodManagerService = workingPeriodManagerService;
        this.departmentManagerService = departmentManagerService;
    }

    public void checkWorkingPeriodIsActive(WorkingPeriod wp) {
        if (wp == null || !Boolean.TRUE.equals(wp.getIsActive())) {
            throw new ResourceNotFoundException("Working period not found or has been deactivated.");
        }
    }

    public void checkCreateRequest(WorkingPeriodCreateRequestDTO dto) {
        if (dto == null) {
            throw new PropertyValidationException("Working period creation payload cannot be null.");
        }
        if (dto.getDepartId() == null) {
            throw new PropertyValidationException("Department ID is required.");
        }
        if (!departmentManagerService.existsById(dto.getDepartId())) {
            throw new ResourceNotFoundException("Department with ID " + dto.getDepartId() + " does not exist.");
        }
        if (dto.getStartAt() == null || dto.getEndAt() == null) {
            throw new PropertyValidationException("Start time and End time are required.");
        }
        if (dto.getEndAt().equals(dto.getStartAt())) {
            throw new PropertyValidationException("Start time and end time must be different.");
        }
        if (workingPeriodManagerService.existsByRangeAndDepartId(dto.getDepartId(), dto.getStartAt(), dto.getEndAt())) {
            throw new PropertyValidationException("Working period with this time range already exists in this department.");
        }
    }

    public void checkUpdateRequest(Long currentId, WorkingPeriodUpdateRequestDTO dto, WorkingPeriod existing) {
        if (dto == null) {
            throw new PropertyValidationException("Working period update payload cannot be null.");
        }
        if (dto.getStartAt() != null && dto.getEndAt() != null) {
            if (dto.getEndAt().equals(dto.getStartAt())) {
                throw new PropertyValidationException("Start time and end time must be different.");
            }
        }
    }
}
