package project.office_workforce_service.controller.common;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import project.office_workforce_service.constant.UserRoles;
import project.office_workforce_service.model.dto.request.PlaceScheduleRuleCreateRequestDTO;
import project.office_workforce_service.model.dto.request.PlaceScheduleRuleUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.PlaceScheduleRuleResponseDTO;
import project.office_workforce_service.service.common.PlaceScheduleRuleService;
import project.shared_office_starter.model.dto.base.APIBaseResponseDTO;

@RestController
@RequestMapping("/place-schedule-rules")
public class PlaceScheduleRuleController {

    private final PlaceScheduleRuleService ruleService;

    @Autowired
    public PlaceScheduleRuleController(PlaceScheduleRuleService ruleService) {
        this.ruleService = ruleService;
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @GetMapping("/place/{placeId}")
    public ResponseEntity<APIBaseResponseDTO<PlaceScheduleRuleResponseDTO>> findByPlaceId(@PathVariable Long placeId) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(ruleService.findByPlaceId(placeId)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @PostMapping
    public ResponseEntity<APIBaseResponseDTO<PlaceScheduleRuleResponseDTO>> create(@Valid @RequestBody PlaceScheduleRuleCreateRequestDTO request) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(ruleService.create(request)));
    }

    @Secured({UserRoles.WORKFORCE_ADMIN})
    @PutMapping("/{id}")
    public ResponseEntity<APIBaseResponseDTO<PlaceScheduleRuleResponseDTO>> update(
        @PathVariable Long id, @Valid @RequestBody PlaceScheduleRuleUpdateRequestDTO request) {
        return ResponseEntity.ok(APIBaseResponseDTO.success(ruleService.update(id, request)));
    }
}