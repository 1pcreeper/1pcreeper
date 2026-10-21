package project.office_transport_service.controller.common;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import project.office_transport_service.constant.UserRoles;
import project.office_transport_service.model.dto.object.PersonSummaryDTO;
import project.office_transport_service.service.common.PersonLookupService;
import project.shared_office_common_lib.constant.role.Roles;
import project.shared_office_starter.model.dto.base.APIBaseResponseDTO;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping({"/transport/persons", "/persons"})
public class PersonLookupController {

    private final PersonLookupService personLookupService;

    @Autowired
    public PersonLookupController(PersonLookupService personLookupService) {
        this.personLookupService = personLookupService;
    }

    @Secured({UserRoles.TRANSPORT_ADMIN, UserRoles.TRANSPORT_USER, Roles.OFFICE_ADMIN, Roles.OFFICE_USER})
    @GetMapping("/search")
    public ResponseEntity<APIBaseResponseDTO<List<PersonSummaryDTO>>> search(
        @RequestParam(required = false) String q
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(personLookupService.searchPersons(q)));
    }

    @Secured({UserRoles.TRANSPORT_ADMIN, UserRoles.TRANSPORT_USER, Roles.OFFICE_ADMIN, Roles.OFFICE_USER})
    @GetMapping("/{uid}")
    public ResponseEntity<APIBaseResponseDTO<PersonSummaryDTO>> findByUid(
        @PathVariable UUID uid
    ) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(personLookupService.findByUid(uid)));
    }
}
