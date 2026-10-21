package project.office_expenditure_service.controller.common;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import project.office_expenditure_service.constant.UserRoles;
import project.office_expenditure_service.model.dto.request.StaffSalaryExpenseCreateRequestDTO;
import project.office_expenditure_service.model.dto.request.StaffSalaryExpenseUpdateRequestDTO;
import project.office_expenditure_service.model.dto.response.StaffSalaryExpenseResponseDTO;
import project.office_expenditure_service.service.common.StaffSalaryExpenseService;
import project.shared_office_common_lib.constant.role.Roles;
import project.shared_office_starter.model.dto.base.APIBaseResponseDTO;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

@RestController
@RequestMapping("/staff-salary-expenses")
public class StaffSalaryExpenseController {

    private final StaffSalaryExpenseService staffSalaryExpenseService;

    @Autowired
    public StaffSalaryExpenseController(StaffSalaryExpenseService staffSalaryExpenseService) {
        this.staffSalaryExpenseService = staffSalaryExpenseService;
    }

    @Secured({UserRoles.EXPENDITURE_ADMIN, UserRoles.EXPENDITURE_USER, Roles.OFFICE_ADMIN, Roles.OFFICE_USER})
    @GetMapping
    public ResponseEntity<APIBaseResponseDTO<PaginationBaseResponseDTO<StaffSalaryExpenseResponseDTO>>> findAll(
        @RequestParam(required = false) Long companyId,
        @RequestParam(required = false) Long staffSalaryId,
        @PageableDefault Pageable pageable
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(staffSalaryExpenseService.findAll(companyId, staffSalaryId, pageable)));
    }

    @Secured({UserRoles.EXPENDITURE_ADMIN, UserRoles.EXPENDITURE_USER, Roles.OFFICE_ADMIN, Roles.OFFICE_USER})
    @GetMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<StaffSalaryExpenseResponseDTO>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(staffSalaryExpenseService.findById(id)));
    }

    @Secured({UserRoles.EXPENDITURE_ADMIN, Roles.OFFICE_ADMIN})
    @PostMapping
    public ResponseEntity<APIBaseResponseDTO<StaffSalaryExpenseResponseDTO>> create(
        @Valid @RequestBody StaffSalaryExpenseCreateRequestDTO requestDTO
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(staffSalaryExpenseService.create(requestDTO)));
    }

    @Secured({UserRoles.EXPENDITURE_ADMIN, Roles.OFFICE_ADMIN})
    @PutMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<StaffSalaryExpenseResponseDTO>> update(
        @PathVariable Long id,
        @Valid @RequestBody StaffSalaryExpenseUpdateRequestDTO requestDTO
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(staffSalaryExpenseService.update(id, requestDTO)));
    }

    @Secured({UserRoles.EXPENDITURE_ADMIN, Roles.OFFICE_ADMIN})
    @DeleteMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<Void>> delete(@PathVariable Long id) {
        staffSalaryExpenseService.delete(id);
        return ResponseEntity.ok(APIBaseResponseDTO.success(null));
    }
}
