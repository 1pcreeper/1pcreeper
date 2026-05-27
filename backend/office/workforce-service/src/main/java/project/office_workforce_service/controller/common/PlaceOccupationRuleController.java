package project.office_workforce_service.controller.common;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import project.office_workforce_service.constant.UserRoles;
import project.office_workforce_service.model.dto.request.PlaceOccupationRuleCreateRequestDTO;
import project.office_workforce_service.model.dto.request.PlaceOccupationRuleUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.PlaceOccupationRuleResponseDTO;
import project.office_workforce_service.service.common.PlaceOccupationRuleService;
import project.shared_office_starter.model.dto.base.APIBaseResponseDTO;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

@RestController
@RequestMapping("/place-occupation-rules")
public class PlaceOccupationRuleController {

    private final PlaceOccupationRuleService ruleService;

    @Autowired
    public PlaceOccupationRuleController(PlaceOccupationRuleService ruleService) {
        this.ruleService = ruleService;
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @GetMapping("/search")
    public ResponseEntity<APIBaseResponseDTO<PaginationBaseResponseDTO<PlaceOccupationRuleResponseDTO>>> search(
        @RequestParam(required = false) Long placeId,
        @RequestParam(required = false) Long occupationId,
        Pageable pageable) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(ruleService.search(placeId, occupationId, pageable)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @PostMapping
    public ResponseEntity<APIBaseResponseDTO<PlaceOccupationRuleResponseDTO>> create(
        @Valid @RequestBody PlaceOccupationRuleCreateRequestDTO request) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(ruleService.create(request)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @PutMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<PlaceOccupationRuleResponseDTO>> update(
        @PathVariable Long id, @Valid @RequestBody PlaceOccupationRuleUpdateRequestDTO request) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(ruleService.update(id, request)));
    }
}