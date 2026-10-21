package project.office_expenditure_service.controller.common;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import project.office_expenditure_service.constant.UserRoles;
import project.office_expenditure_service.model.dto.request.StaffSalaryCreateRequestDTO;
import project.office_expenditure_service.model.dto.request.StaffSalaryUpdateRequestDTO;
import project.office_expenditure_service.model.dto.response.StaffSalaryResponseDTO;
import project.office_expenditure_service.service.common.StaffSalaryService;
import project.shared_office_common_lib.constant.role.Roles;
import project.shared_office_starter.model.dto.base.APIBaseResponseDTO;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

@RestController
@RequestMapping("/staff-salaries")
public class StaffSalaryController {

    private final StaffSalaryService staffSalaryService;

    @Autowired
    public StaffSalaryController(StaffSalaryService staffSalaryService) {
        this.staffSalaryService = staffSalaryService;
    }

    @Secured({UserRoles.EXPENDITURE_ADMIN, UserRoles.EXPENDITURE_USER, Roles.OFFICE_ADMIN, Roles.OFFICE_USER})
    @GetMapping
    public ResponseEntity<APIBaseResponseDTO<PaginationBaseResponseDTO<StaffSalaryResponseDTO>>> findAll(
        @RequestParam(required = false) Long staffId,
        @PageableDefault Pageable pageable
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(staffSalaryService.findAll(staffId, pageable)));
    }

    @Secured({UserRoles.EXPENDITURE_ADMIN, UserRoles.EXPENDITURE_USER, Roles.OFFICE_ADMIN, Roles.OFFICE_USER})
    @GetMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<StaffSalaryResponseDTO>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(staffSalaryService.findById(id)));
    }

    @Secured({UserRoles.EXPENDITURE_ADMIN, Roles.OFFICE_ADMIN})
    @PostMapping
    public ResponseEntity<APIBaseResponseDTO<StaffSalaryResponseDTO>> create(
        @Valid @RequestBody StaffSalaryCreateRequestDTO requestDTO
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(staffSalaryService.create(requestDTO)));
    }

    @Secured({UserRoles.EXPENDITURE_ADMIN, Roles.OFFICE_ADMIN})
    @PutMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<StaffSalaryResponseDTO>> update(
        @PathVariable Long id,
        @Valid @RequestBody StaffSalaryUpdateRequestDTO requestDTO
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(staffSalaryService.update(id, requestDTO)));
    }

    @Secured({UserRoles.EXPENDITURE_ADMIN, Roles.OFFICE_ADMIN})
    @DeleteMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<Void>> delete(@PathVariable Long id) {
        staffSalaryService.delete(id);
        return ResponseEntity.ok(APIBaseResponseDTO.success(null));
    }
}
