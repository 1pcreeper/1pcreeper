package project.office_workforce_service.controller.common;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import project.office_workforce_service.constant.UserRoles;
import project.office_workforce_service.model.dto.request.PlaceWorkingPeriodRuleCreateRequestDTO;
import project.office_workforce_service.model.dto.request.PlaceWorkingPeriodRuleUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.PlaceWorkingPeriodRuleResponseDTO;
import project.office_workforce_service.service.common.PlaceWorkingPeriodRuleService;
import project.shared_office_starter.model.dto.base.APIBaseResponseDTO;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

@RestController
@RequestMapping("/place-working-period-rules")
public class PlaceWorkingPeriodRuleController {

    private final PlaceWorkingPeriodRuleService ruleService;

    @Autowired
    public PlaceWorkingPeriodRuleController(PlaceWorkingPeriodRuleService ruleService) {
        this.ruleService = ruleService;
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @GetMapping("/search")
    public ResponseEntity<APIBaseResponseDTO<PaginationBaseResponseDTO<PlaceWorkingPeriodRuleResponseDTO>>> search(
        @RequestParam(required = false) Long placeId,
        @RequestParam(required = false) Long workingPeriodId,
        Pageable pageable) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(ruleService.search(placeId, workingPeriodId, pageable)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @PostMapping
    public ResponseEntity<APIBaseResponseDTO<PlaceWorkingPeriodRuleResponseDTO>> create(
        @Valid @RequestBody PlaceWorkingPeriodRuleCreateRequestDTO request) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(ruleService.create(request)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @PutMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<PlaceWorkingPeriodRuleResponseDTO>> update(
        @PathVariable Long id, @Valid @RequestBody PlaceWorkingPeriodRuleUpdateRequestDTO request) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(ruleService.update(id, request)));
    }
}