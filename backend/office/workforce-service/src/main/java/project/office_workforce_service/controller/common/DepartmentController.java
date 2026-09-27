package project.office_workforce_service.controller.common;

import jakarta.annotation.Nullable;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import project.office_workforce_service.constant.UserRoles;
import project.office_workforce_service.model.dto.request.DepartmentCreateRequestDTO;
import project.office_workforce_service.model.dto.request.DepartmentUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.DepartmentResponseDTO;
import project.office_workforce_service.service.common.DepartmentService;
import project.shared_office_common_lib.constant.role.Roles;
import project.shared_office_starter.model.dto.base.APIBaseResponseDTO;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

@RestController
@RequestMapping("/departments")
public class DepartmentController {

    private final DepartmentService departmentService;

    @Autowired
    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @Secured({UserRoles.WORKFORCE_ADMIN, Roles.OFFICE_ADMIN})
    @GetMapping("/search")
    public ResponseEntity<APIBaseResponseDTO<PaginationBaseResponseDTO<DepartmentResponseDTO>>> search(
        @RequestParam(required = false) Long companyId,
        @RequestParam(required = false) String q,
        @RequestParam(required = false, defaultValue = "true") Boolean isActive,
        Pageable pageable
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(departmentService.search(companyId, q, isActive, pageable)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN, Roles.OFFICE_ADMIN})
    @GetMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<DepartmentResponseDTO>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(departmentService.findById(id)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN, Roles.OFFICE_ADMIN})
    @PostMapping
    public ResponseEntity<APIBaseResponseDTO<DepartmentResponseDTO>> create(@Valid @RequestBody DepartmentCreateRequestDTO request) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(departmentService.create(request)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN, Roles.OFFICE_ADMIN})
    @PutMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<DepartmentResponseDTO>> update(
        @PathVariable("id") Long id, @Valid @RequestBody DepartmentUpdateRequestDTO request) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(departmentService.update(id, request)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN, Roles.OFFICE_ADMIN})
    @GetMapping()
    public ResponseEntity<APIBaseResponseDTO<PaginationBaseResponseDTO<DepartmentResponseDTO>>> findAll(
        @PageableDefault Pageable pageable,
        @Nullable @RequestParam(value = "companyId", required = false) Long companyId
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(departmentService.findAll(pageable,companyId)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN, Roles.OFFICE_ADMIN})
    @DeleteMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<Void>> delete(@PathVariable("id") Long id) {
        departmentService.delete(id);
        return ResponseEntity.ok(APIBaseResponseDTO.success(null));
    }
}