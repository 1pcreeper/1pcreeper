package project.office_expenditure_service.controller.common;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import project.office_expenditure_service.constant.UserRoles;
import project.office_expenditure_service.model.dto.request.OutcomeExpenseCreateRequestDTO;
import project.office_expenditure_service.model.dto.request.OutcomeExpenseUpdateRequestDTO;
import project.office_expenditure_service.model.dto.response.OutcomeExpenseResponseDTO;
import project.office_expenditure_service.service.common.OutcomeExpenseService;
import project.shared_office_common_lib.constant.role.Roles;
import project.shared_office_starter.model.dto.base.APIBaseResponseDTO;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

@RestController
@RequestMapping("/outcome-expenses")
public class OutcomeExpenseController {

    private final OutcomeExpenseService outcomeExpenseService;

    @Autowired
    public OutcomeExpenseController(OutcomeExpenseService outcomeExpenseService) {
        this.outcomeExpenseService = outcomeExpenseService;
    }

    @Secured({UserRoles.EXPENDITURE_ADMIN, UserRoles.EXPENDITURE_USER, Roles.OFFICE_ADMIN, Roles.OFFICE_USER})
    @GetMapping
    public ResponseEntity<APIBaseResponseDTO<PaginationBaseResponseDTO<OutcomeExpenseResponseDTO>>> findAll(
        @RequestParam(required = false) Long companyId,
        @RequestParam(required = false) Long outcomeId,
        @PageableDefault Pageable pageable
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(outcomeExpenseService.findAll(companyId, outcomeId, pageable)));
    }

    @Secured({UserRoles.EXPENDITURE_ADMIN, UserRoles.EXPENDITURE_USER, Roles.OFFICE_ADMIN, Roles.OFFICE_USER})
    @GetMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<OutcomeExpenseResponseDTO>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(outcomeExpenseService.findById(id)));
    }

    @Secured({UserRoles.EXPENDITURE_ADMIN, Roles.OFFICE_ADMIN})
    @PostMapping
    public ResponseEntity<APIBaseResponseDTO<OutcomeExpenseResponseDTO>> create(
        @Valid @RequestBody OutcomeExpenseCreateRequestDTO requestDTO
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(outcomeExpenseService.create(requestDTO)));
    }

    @Secured({UserRoles.EXPENDITURE_ADMIN, Roles.OFFICE_ADMIN})
    @PutMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<OutcomeExpenseResponseDTO>> update(
        @PathVariable Long id,
        @Valid @RequestBody OutcomeExpenseUpdateRequestDTO requestDTO
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(outcomeExpenseService.update(id, requestDTO)));
    }

    @Secured({UserRoles.EXPENDITURE_ADMIN, Roles.OFFICE_ADMIN})
    @DeleteMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<Void>> delete(@PathVariable Long id) {
        outcomeExpenseService.delete(id);
        return ResponseEntity.ok(APIBaseResponseDTO.success(null));
    }
}
