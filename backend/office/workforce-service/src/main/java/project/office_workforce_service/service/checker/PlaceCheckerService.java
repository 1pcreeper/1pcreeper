package project.office_workforce_service.service.checker;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import project.office_workforce_service.model.dto.request.PlaceCreateRequestDTO;
import project.office_workforce_service.model.dto.request.PlaceUpdateRequestDTO;
import project.office_workforce_service.model.entity.Place;
import project.office_workforce_service.service.manager.DepartmentManagerService;
import project.office_workforce_service.service.manager.PlaceManagerService;
import project.shared_office_starter.model.exception.PropertyValidationException;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

@Service
public class PlaceCheckerService {

    private final PlaceManagerService placeManagerService;
    private final DepartmentManagerService departmentManagerService;

    @Autowired
    public PlaceCheckerService(PlaceManagerService placeManagerService, DepartmentManagerService departmentManagerService) {
        this.placeManagerService = placeManagerService;
        this.departmentManagerService = departmentManagerService;
    }

    public void checkPlaceIsActive(Place place) {
        if (place == null || !Boolean.TRUE.equals(place.getIsActive())) {
            throw new ResourceNotFoundException("Place not found or has been deactivated.");
        }
    }

    public void checkCreateRequest(PlaceCreateRequestDTO dto) {
        if (dto == null) {
            throw new PropertyValidationException("Place creation payload cannot be null.");
        }
        if (dto.getDepartId() == null) {
            throw new PropertyValidationException("Department ID is required.");
        }
        if (!departmentManagerService.existsById(dto.getDepartId())) {
            throw new ResourceNotFoundException("Department with ID " + dto.getDepartId() + " does not exist.");
        }
        if (dto.getName() == null || dto.getName().isBlank()) {
            throw new PropertyValidationException("Place name cannot be blank.");
        }
        if (placeManagerService.existsByDepartmentIdAndNameIgnoreCase(dto.getDepartId(), dto.getName().trim())) {
            throw new PropertyValidationException("Place with name '" + dto.getName() + "' already exists in this department.");
        }
    }

    public void checkUpdateRequest(Long currentId, PlaceUpdateRequestDTO dto, Place existing) {
        if (dto == null) {
            throw new PropertyValidationException("Place update payload cannot be null.");
        }
        Long departId = dto.getDepartId() != null ? dto.getDepartId() : existing.getDepartment().getId();
        if (dto.getDepartId() != null && !departmentManagerService.existsById(dto.getDepartId())) {
            throw new ResourceNotFoundException("Department with ID " + dto.getDepartId() + " does not exist.");
        }
        if (dto.getName() != null && !dto.getName().isBlank()) {
            placeManagerService.findByDepartmentIdAndNameIgnoreCase(departId, dto.getName().trim())
                .ifPresent(p -> {
                    if (!p.getId().equals(currentId)) {
                        throw new PropertyValidationException("Another place with name '" + dto.getName() + "' already exists in this department.");
                    }
                });
        }
    }
}
