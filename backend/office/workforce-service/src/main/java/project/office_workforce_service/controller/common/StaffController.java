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
import project.office_workforce_service.model.dto.request.StaffCreateRequestDTO;
import project.office_workforce_service.model.dto.request.StaffUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.CompanyResponseDTO;
import project.office_workforce_service.model.dto.response.StaffDetailResponseDTO;
import project.office_workforce_service.model.dto.response.StaffResponseDTO;
import project.office_workforce_service.model.entity.enums.WorkType;
import project.office_workforce_service.service.common.StaffService;
import project.shared_office_starter.model.dto.base.APIBaseResponseDTO;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

@RestController
@RequestMapping("/staffs")
public class StaffController {

    private final StaffService staffService;

    @Autowired
    public StaffController(StaffService staffService) {
        this.staffService = staffService;
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @GetMapping("/search")
    public ResponseEntity<APIBaseResponseDTO<PaginationBaseResponseDTO<StaffResponseDTO>>> search(
        @RequestParam(required = false) String q,
        @RequestParam(required = false) Long companyId,
        @RequestParam(required = false) Long orgId,
        @RequestParam(required = false) WorkType workType,
        @RequestParam(required = false,defaultValue = "true") Boolean isActive,
        Pageable pageable) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(staffService.search(q, companyId, orgId, workType, isActive, pageable)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @GetMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<StaffResponseDTO>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(staffService.findById(id)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @PostMapping
    public ResponseEntity<APIBaseResponseDTO<StaffResponseDTO>> create(@Valid @RequestBody StaffCreateRequestDTO request) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(staffService.create(request)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @PutMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<StaffResponseDTO>> update(
        @PathVariable Long id, @Valid @RequestBody StaffUpdateRequestDTO request) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(staffService.update(id, request)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @GetMapping()
    public ResponseEntity<APIBaseResponseDTO<PaginationBaseResponseDTO<StaffResponseDTO>>> findAll(
        @PageableDefault Pageable pageable,
        @Nullable @RequestParam(value = "companyId",required = false)Long companyId
        ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(staffService.findAll(pageable,companyId)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @GetMapping("/details/{id}")
    public ResponseEntity<APIBaseResponseDTO<StaffDetailResponseDTO>> findByIdInDetail(@PathVariable Long id) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(staffService.findByIdInDetail(id)));
    }
    @Secured({UserRoles.WORKFORCE_ADMIN})
    @DeleteMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<Void>> delete(@PathVariable("id") Long id) {
        staffService.delete(id);
        return ResponseEntity.ok(APIBaseResponseDTO.success(null));
    }
}