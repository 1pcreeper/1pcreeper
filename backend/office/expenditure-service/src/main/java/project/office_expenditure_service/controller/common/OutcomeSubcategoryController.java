package project.office_expenditure_service.controller.common;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import project.office_expenditure_service.constant.UserRoles;
import project.office_expenditure_service.model.dto.request.OutcomeSubcategoryCreateRequestDTO;
import project.office_expenditure_service.model.dto.request.OutcomeSubcategoryUpdateRequestDTO;
import project.office_expenditure_service.model.dto.response.OutcomeSubcategoryResponseDTO;
import project.office_expenditure_service.service.common.OutcomeSubcategoryService;
import project.shared_office_common_lib.constant.role.Roles;
import project.shared_office_starter.model.dto.base.APIBaseResponseDTO;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

@RestController
@RequestMapping("/subcategories")
public class OutcomeSubcategoryController {

    private final OutcomeSubcategoryService outcomeSubcategoryService;

    @Autowired
    public OutcomeSubcategoryController(OutcomeSubcategoryService outcomeSubcategoryService) {
        this.outcomeSubcategoryService = outcomeSubcategoryService;
    }

    @Secured({UserRoles.EXPENDITURE_ADMIN, UserRoles.EXPENDITURE_USER, Roles.OFFICE_ADMIN, Roles.OFFICE_USER})
    @GetMapping
    public ResponseEntity<APIBaseResponseDTO<PaginationBaseResponseDTO<OutcomeSubcategoryResponseDTO>>> findAll(
        @RequestParam(required = false) Long categoryId,
        @RequestParam(required = false) Long companyId,
        @PageableDefault Pageable pageable
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(outcomeSubcategoryService.findAll(categoryId, companyId, pageable)));
    }

    @Secured({UserRoles.EXPENDITURE_ADMIN, UserRoles.EXPENDITURE_USER, Roles.OFFICE_ADMIN, Roles.OFFICE_USER})
    @GetMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<OutcomeSubcategoryResponseDTO>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(outcomeSubcategoryService.findById(id)));
    }

    @Secured({UserRoles.EXPENDITURE_ADMIN, Roles.OFFICE_ADMIN})
    @PostMapping
    public ResponseEntity<APIBaseResponseDTO<OutcomeSubcategoryResponseDTO>> create(
        @Valid @RequestBody OutcomeSubcategoryCreateRequestDTO requestDTO
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(outcomeSubcategoryService.create(requestDTO)));
    }

    @Secured({UserRoles.EXPENDITURE_ADMIN, Roles.OFFICE_ADMIN})
    @PutMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<OutcomeSubcategoryResponseDTO>> update(
        @PathVariable Long id,
        @Valid @RequestBody OutcomeSubcategoryUpdateRequestDTO requestDTO
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(outcomeSubcategoryService.update(id, requestDTO)));
    }

    @Secured({UserRoles.EXPENDITURE_ADMIN, Roles.OFFICE_ADMIN})
    @DeleteMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<Void>> delete(@PathVariable Long id) {
        outcomeSubcategoryService.delete(id);
        return ResponseEntity.ok(APIBaseResponseDTO.success(null));
    }
}
