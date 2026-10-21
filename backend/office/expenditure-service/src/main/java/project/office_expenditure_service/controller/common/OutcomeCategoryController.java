package project.office_expenditure_service.controller.common;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import project.office_expenditure_service.constant.UserRoles;
import project.office_expenditure_service.model.dto.request.OutcomeCategoryCreateRequestDTO;
import project.office_expenditure_service.model.dto.request.OutcomeCategoryUpdateRequestDTO;
import project.office_expenditure_service.model.dto.response.OutcomeCategoryResponseDTO;
import project.office_expenditure_service.service.common.OutcomeCategoryService;
import project.shared_office_common_lib.constant.role.Roles;
import project.shared_office_starter.model.dto.base.APIBaseResponseDTO;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

@RestController
@RequestMapping("/categories")
public class OutcomeCategoryController {

    private final OutcomeCategoryService outcomeCategoryService;

    @Autowired
    public OutcomeCategoryController(OutcomeCategoryService outcomeCategoryService) {
        this.outcomeCategoryService = outcomeCategoryService;
    }

    @Secured({UserRoles.EXPENDITURE_ADMIN, UserRoles.EXPENDITURE_USER, Roles.OFFICE_ADMIN, Roles.OFFICE_USER})
    @GetMapping
    public ResponseEntity<APIBaseResponseDTO<PaginationBaseResponseDTO<OutcomeCategoryResponseDTO>>> findAll(
        @RequestParam(required = false) Long companyId,
        @PageableDefault Pageable pageable
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(outcomeCategoryService.findAll(companyId, pageable)));
    }

    @Secured({UserRoles.EXPENDITURE_ADMIN, UserRoles.EXPENDITURE_USER, Roles.OFFICE_ADMIN, Roles.OFFICE_USER})
    @GetMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<OutcomeCategoryResponseDTO>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(outcomeCategoryService.findById(id)));
    }

    @Secured({UserRoles.EXPENDITURE_ADMIN, Roles.OFFICE_ADMIN})
    @PostMapping
    public ResponseEntity<APIBaseResponseDTO<OutcomeCategoryResponseDTO>> create(
        @Valid @RequestBody OutcomeCategoryCreateRequestDTO requestDTO
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(outcomeCategoryService.create(requestDTO)));
    }

    @Secured({UserRoles.EXPENDITURE_ADMIN, Roles.OFFICE_ADMIN})
    @PutMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<OutcomeCategoryResponseDTO>> update(
        @PathVariable Long id,
        @Valid @RequestBody OutcomeCategoryUpdateRequestDTO requestDTO
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(outcomeCategoryService.update(id, requestDTO)));
    }

    @Secured({UserRoles.EXPENDITURE_ADMIN, Roles.OFFICE_ADMIN})
    @DeleteMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<Void>> delete(@PathVariable Long id) {
        outcomeCategoryService.delete(id);
        return ResponseEntity.ok(APIBaseResponseDTO.success(null));
    }
}
