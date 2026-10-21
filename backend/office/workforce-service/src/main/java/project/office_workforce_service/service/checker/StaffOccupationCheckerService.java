package project.office_workforce_service.service.checker;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import project.office_workforce_service.model.dto.request.StaffOccupationCreateRequestDTO;
import project.office_workforce_service.model.dto.request.StaffOccupationUpdateRequestDTO;
import project.office_workforce_service.service.manager.OccupationManagerService;
import project.office_workforce_service.service.manager.StaffManagerService;
import project.office_workforce_service.service.manager.StaffOccupationManagerService;
import project.shared_office_starter.model.exception.PropertyValidationException;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

@Service
public class StaffOccupationCheckerService {

    private final StaffOccupationManagerService staffOccupationManagerService;
    private final StaffManagerService staffManagerService;
    private final OccupationManagerService occupationManagerService;

    @Autowired
    public StaffOccupationCheckerService(
        StaffOccupationManagerService staffOccupationManagerService,
        StaffManagerService staffManagerService,
        OccupationManagerService occupationManagerService
    ) {
        this.staffOccupationManagerService = staffOccupationManagerService;
        this.staffManagerService = staffManagerService;
        this.occupationManagerService = occupationManagerService;
    }

    public void checkCreateRequest(StaffOccupationCreateRequestDTO dto) {
        if (dto == null) {
            throw new PropertyValidationException("Staff occupation assignment payload cannot be null.");
        }
        if (dto.getStaffId() == null) {
            throw new PropertyValidationException("Staff ID is required.");
        }
        if (!staffManagerService.existsById(dto.getStaffId())) {
            throw new ResourceNotFoundException("Staff with ID " + dto.getStaffId() + " does not exist.");
        }
        if (dto.getOccupationId() == null) {
            throw new PropertyValidationException("Occupation ID is required.");
        }
        if (!occupationManagerService.existsById(dto.getOccupationId())) {
            throw new ResourceNotFoundException("Occupation with ID " + dto.getOccupationId() + " does not exist.");
        }
        if (staffOccupationManagerService.existsByStaffIdAndOccupationId(dto.getStaffId(), dto.getOccupationId())) {
            throw new PropertyValidationException("This occupation is already assigned to the staff member.");
        }
    }

    public void checkUpdateRequest(Long currentId, Long staffId, StaffOccupationUpdateRequestDTO dto) {
        if (dto == null) {
            throw new PropertyValidationException("Staff occupation update payload cannot be null.");
        }
        if (dto.getOccupationId() != null) {
            if (!occupationManagerService.existsById(dto.getOccupationId())) {
                throw new ResourceNotFoundException("Occupation with ID " + dto.getOccupationId() + " does not exist.");
            }
            staffOccupationManagerService.findByStaffIdAndOccupationId(staffId, dto.getOccupationId())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(currentId)) {
                        throw new PropertyValidationException("This staff member already has the specified occupation.");
                    }
                });
        }
    }
}
