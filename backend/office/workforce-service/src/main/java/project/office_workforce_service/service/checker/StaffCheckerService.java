package project.office_workforce_service.service.checker;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import project.office_workforce_service.model.dto.request.StaffCreateRequestDTO;
import project.office_workforce_service.model.dto.request.StaffUpdateRequestDTO;
import project.office_workforce_service.model.entity.Staff;
import project.office_workforce_service.service.manager.CompanyManagerService;
import project.office_workforce_service.service.manager.DepartmentManagerService;
import project.office_workforce_service.service.manager.PersonManagerService;
import project.office_workforce_service.service.manager.StaffManagerService;
import project.shared_office_starter.model.exception.PropertyValidationException;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

@Service
public class StaffCheckerService {

    private final StaffManagerService staffManagerService;
    private final PersonManagerService personManagerService;
    private final CompanyManagerService companyManagerService;
    private final DepartmentManagerService departmentManagerService;

    @Autowired
    public StaffCheckerService(
        StaffManagerService staffManagerService,
        PersonManagerService personManagerService,
        CompanyManagerService companyManagerService,
        DepartmentManagerService departmentManagerService
    ) {
        this.staffManagerService = staffManagerService;
        this.personManagerService = personManagerService;
        this.companyManagerService = companyManagerService;
        this.departmentManagerService = departmentManagerService;
    }

    public void checkStaffIsActive(Staff staff) {
        if (staff == null || !Boolean.TRUE.equals(staff.getIsActive())) {
            throw new ResourceNotFoundException("Staff not found or has been deactivated.");
        }
    }

    public void checkCreateRequest(StaffCreateRequestDTO dto) {
        if (dto == null) {
            throw new PropertyValidationException("Staff creation payload cannot be null.");
        }
        if (dto.getPersonId() == null) {
            throw new PropertyValidationException("Person ID is required.");
        }
        if (!personManagerService.existsById(dto.getPersonId())) {
            throw new ResourceNotFoundException("Person with ID " + dto.getPersonId() + " does not exist.");
        }
        if (dto.getCompanyId() == null) {
            throw new PropertyValidationException("Company ID is required.");
        }
        if (!companyManagerService.existsById(dto.getCompanyId())) {
            throw new ResourceNotFoundException("Company with ID " + dto.getCompanyId() + " does not exist.");
        }
        if (dto.getDepartId() == null) {
            throw new PropertyValidationException("Department ID is required.");
        }
        try {
            var dep = departmentManagerService.findById(dto.getDepartId());
            if (!dep.getCompany().getId().equals(dto.getCompanyId())) {
                throw new PropertyValidationException("Department does not belong to the specified company.");
            }
        } catch (ResourceNotFoundException e) {
            throw new ResourceNotFoundException("Department with ID " + dto.getDepartId() + " does not exist.");
        }

        if (staffManagerService.existsByPersonIdAndCompanyId(dto.getPersonId(), dto.getCompanyId())) {
            throw new PropertyValidationException("Person is already registered as staff in this company.");
        }

        if (dto.getCustId() != null && !dto.getCustId().isBlank()) {
            if (staffManagerService.existsByCompanyIdAndCustIdIgnoreCase(dto.getCompanyId(), dto.getCustId().trim())) {
                throw new PropertyValidationException("Custom ID '" + dto.getCustId() + "' already exists in this company.");
            }
        }
    }

    public void checkUpdateRequest(Long currentId, StaffUpdateRequestDTO dto, Staff existing) {
        if (dto == null) {
            throw new PropertyValidationException("Staff update payload cannot be null.");
        }
        Long companyId = existing.getCompany().getId();
        if (dto.getDepartId() != null) {
            try {
                var dep = departmentManagerService.findById(dto.getDepartId());
                if (!dep.getCompany().getId().equals(companyId)) {
                    throw new PropertyValidationException("Department does not belong to the staff's company.");
                }
            } catch (ResourceNotFoundException e) {
                throw new ResourceNotFoundException("Department with ID " + dto.getDepartId() + " does not exist.");
            }
        }
        if (dto.getCustId() != null && !dto.getCustId().isBlank()) {
            staffManagerService.findByCompanyIdAndCustIdIgnoreCase(companyId, dto.getCustId().trim())
                .ifPresent(other -> {
                    if (!other.getId().equals(currentId)) {
                        throw new PropertyValidationException("Another staff in this company already holds Custom ID '" + dto.getCustId() + "'.");
                    }
                });
        }
    }
}
