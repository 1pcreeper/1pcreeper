package project.office_workforce_service.service.checker;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import project.office_workforce_service.model.dto.request.OccupationCreateRequestDTO;
import project.office_workforce_service.model.dto.request.OccupationUpdateRequestDTO;
import project.office_workforce_service.model.entity.Occupation;
import project.office_workforce_service.service.manager.DepartmentManagerService;
import project.office_workforce_service.service.manager.OccupationManagerService;
import project.shared_office_starter.model.exception.PropertyValidationException;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

@Service
public class OccupationCheckerService {

    private final OccupationManagerService occupationManagerService;
    private final DepartmentManagerService departmentManagerService;

    @Autowired
    public OccupationCheckerService(OccupationManagerService occupationManagerService, DepartmentManagerService departmentManagerService) {
        this.occupationManagerService = occupationManagerService;
        this.departmentManagerService = departmentManagerService;
    }

    public void checkOccupationIsActive(Occupation occupation) {
        if (occupation == null || !Boolean.TRUE.equals(occupation.getIsActive())) {
            throw new ResourceNotFoundException("Occupation not found or has been deactivated.");
        }
    }

    public void checkCreateRequest(OccupationCreateRequestDTO dto) {
        if (dto == null) {
            throw new PropertyValidationException("Occupation creation payload cannot be null.");
        }
        if (dto.getDepartId() == null) {
            throw new PropertyValidationException("Department ID is required.");
        }
        if (!departmentManagerService.existsById(dto.getDepartId())) {
            throw new ResourceNotFoundException("Department with ID " + dto.getDepartId() + " does not exist.");
        }
        if (dto.getName() == null || dto.getName().isBlank()) {
            throw new PropertyValidationException("Occupation name cannot be blank.");
        }
        if (occupationManagerService.existsByDepartmentIdAndNameIgnoreCase(dto.getDepartId(), dto.getName().trim())) {
            throw new PropertyValidationException("Occupation with name '" + dto.getName() + "' already exists in this department.");
        }
    }

    public void checkUpdateRequest(Long currentId, OccupationUpdateRequestDTO dto, Occupation existing) {
        if (dto == null) {
            throw new PropertyValidationException("Occupation update payload cannot be null.");
        }
        if (dto.getName() != null && !dto.getName().isBlank()) {
            Long departId = existing.getDepartment().getId();
            occupationManagerService.findByDepartmentIdAndNameIgnoreCase(departId, dto.getName().trim())
                .ifPresent(occ -> {
                    if (!occ.getId().equals(currentId)) {
                        throw new PropertyValidationException("Another occupation with name '" + dto.getName() + "' already exists in this department.");
                    }
                });
        }
    }
}
