package project.office_expenditure_service.controller.common;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import project.office_expenditure_service.constant.UserRoles;
import project.office_expenditure_service.model.dto.request.OutcomeCreateRequestDTO;
import project.office_expenditure_service.model.dto.request.OutcomeUpdateRequestDTO;
import project.office_expenditure_service.model.dto.response.OutcomeResponseDTO;
import project.office_expenditure_service.service.common.OutcomeService;
import project.shared_office_common_lib.constant.role.Roles;
import project.shared_office_starter.model.dto.base.APIBaseResponseDTO;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

@RestController
@RequestMapping("/outcomes")
public class OutcomeController {

    private final OutcomeService outcomeService;

    @Autowired
    public OutcomeController(OutcomeService outcomeService) {
        this.outcomeService = outcomeService;
    }

    @Secured({UserRoles.EXPENDITURE_ADMIN, UserRoles.EXPENDITURE_USER, Roles.OFFICE_ADMIN, Roles.OFFICE_USER})
    @GetMapping
    public ResponseEntity<APIBaseResponseDTO<PaginationBaseResponseDTO<OutcomeResponseDTO>>> findAll(
        @RequestParam(required = false) Long subcategoryId,
        @RequestParam(required = false) Long companyId,
        @PageableDefault Pageable pageable
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(outcomeService.findAll(subcategoryId, companyId, pageable)));
    }

    @Secured({UserRoles.EXPENDITURE_ADMIN, UserRoles.EXPENDITURE_USER, Roles.OFFICE_ADMIN, Roles.OFFICE_USER})
    @GetMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<OutcomeResponseDTO>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(outcomeService.findById(id)));
    }

    @Secured({UserRoles.EXPENDITURE_ADMIN, Roles.OFFICE_ADMIN})
    @PostMapping
    public ResponseEntity<APIBaseResponseDTO<OutcomeResponseDTO>> create(
        @Valid @RequestBody OutcomeCreateRequestDTO requestDTO
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(outcomeService.create(requestDTO)));
    }

    @Secured({UserRoles.EXPENDITURE_ADMIN, Roles.OFFICE_ADMIN})
    @PutMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<OutcomeResponseDTO>> update(
        @PathVariable Long id,
        @Valid @RequestBody OutcomeUpdateRequestDTO requestDTO
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(outcomeService.update(id, requestDTO)));
    }

    @Secured({UserRoles.EXPENDITURE_ADMIN, Roles.OFFICE_ADMIN})
    @DeleteMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<Void>> delete(@PathVariable Long id) {
        outcomeService.delete(id);
        return ResponseEntity.ok(APIBaseResponseDTO.success(null));
    }
}
