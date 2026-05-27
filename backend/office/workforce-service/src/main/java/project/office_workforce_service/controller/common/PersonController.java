package project.office_workforce_service.controller.common;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import project.office_workforce_service.constant.UserRoles;
import project.office_workforce_service.model.dto.request.PersonCreateRequestDTO;
import project.office_workforce_service.model.dto.request.PersonUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.PersonResponseDTO;
import project.office_workforce_service.service.common.PersonService;
import project.shared_office_starter.model.dto.base.APIBaseResponseDTO;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

@RestController
@RequestMapping("/persons")
public class PersonController {

    private final PersonService personService;

    @Autowired
    public PersonController(PersonService personService) {
        this.personService = personService;
    }
    @Secured({UserRoles.WORKFORCE_ADMIN})
    @GetMapping("/search")
    public ResponseEntity<APIBaseResponseDTO<PaginationBaseResponseDTO<PersonResponseDTO>>> search(
        @RequestParam(required = false) String q,
        @RequestParam(required = false) Boolean isActive,
        Pageable pageable) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(personService.search(q, isActive, pageable)));
    }
    @Secured({UserRoles.WORKFORCE_ADMIN})
    @GetMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<PersonResponseDTO>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(personService.findById(id)));
    }
    @Secured({UserRoles.WORKFORCE_ADMIN})
    @PostMapping
    public ResponseEntity<APIBaseResponseDTO<PersonResponseDTO>> create(@Valid @RequestBody PersonCreateRequestDTO request) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(personService.create(request)));
    }
    @Secured({UserRoles.WORKFORCE_ADMIN})
    @PutMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<PersonResponseDTO>> update(
        @PathVariable Long id, @Valid @RequestBody PersonUpdateRequestDTO request) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(personService.update(id, request)));
    }
}