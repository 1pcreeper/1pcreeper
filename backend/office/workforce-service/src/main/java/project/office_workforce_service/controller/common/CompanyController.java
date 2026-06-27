package project.office_workforce_service.controller.common;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import project.office_workforce_service.constant.UserRoles;
import project.office_workforce_service.model.dto.request.CompanyCreateRequestDTO;
import project.office_workforce_service.model.dto.request.CompanyUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.CompanyResponseDTO;
import project.office_workforce_service.service.common.CompanyService;
import project.shared_office_starter.model.dto.base.APIBaseResponseDTO;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

@RestController
@RequestMapping("/companies")
public class CompanyController {

    private final CompanyService companyService;

    @Autowired
    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @GetMapping("/search")
    public ResponseEntity<APIBaseResponseDTO<PaginationBaseResponseDTO<CompanyResponseDTO>>> search(
        @RequestParam(required = false) String q,
        @RequestParam(required = false,defaultValue = "true") Boolean isActive,
        Pageable pageable) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(companyService.search(q, isActive, pageable)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @GetMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<CompanyResponseDTO>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(companyService.findById(id)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @GetMapping
    public ResponseEntity<APIBaseResponseDTO<PaginationBaseResponseDTO<CompanyResponseDTO>>> findAll(@PageableDefault Pageable pageable) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(companyService.findAll(pageable)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @PostMapping
    public ResponseEntity<APIBaseResponseDTO<CompanyResponseDTO>> create(@Valid @RequestBody CompanyCreateRequestDTO request) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(companyService.create(request)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @PutMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<CompanyResponseDTO>> update(
        @PathVariable Long id, @Valid @RequestBody CompanyUpdateRequestDTO request) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(companyService.update(id, request)));
    }
}