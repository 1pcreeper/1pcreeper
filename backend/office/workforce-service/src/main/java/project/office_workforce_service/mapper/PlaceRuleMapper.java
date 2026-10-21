package project.office_workforce_service.mapper;

import org.springframework.stereotype.Component;
import project.office_workforce_service.model.dto.request.*;
import project.office_workforce_service.model.dto.response.*;
import project.office_workforce_service.model.entity.*;

@Component
public class PlaceRuleMapper {

    // --- Place Schedule Rule ---
    public PlaceScheduleRule toScheduleRuleEntity(PlaceScheduleRuleCreateRequestDTO request, Place place) {
        if (request == null) return null;

        return PlaceScheduleRule.builder()
            .place(place)
            .workTypePriorities(request.getWorkTypePriorities())
            .build();
    }

    public void updateScheduleRuleEntity(PlaceScheduleRuleUpdateRequestDTO request, PlaceScheduleRule entity) {
        if (request == null || entity == null) return;

        if (request.getWorkTypePriorities() != null) entity.setWorkTypePriorities(request.getWorkTypePriorities());
    }

    public PlaceScheduleRuleResponseDTO toScheduleRuleResponseDTO(PlaceScheduleRule entity) {
        if (entity == null) return null;

        return PlaceScheduleRuleResponseDTO.builder()
            .id(entity.getId())
            .placeId(entity.getPlace() != null ? entity.getPlace().getId() : null)
            .workTypePriorities(entity.getWorkTypePriorities())
            .build();
    }

    // --- Place Working Period Rule ---
    public PlaceWorkingPeriodRule toWorkingPeriodRuleEntity(PlaceWorkingPeriodRuleCreateRequestDTO request, PlaceOccupationRule occupationRule, WorkingPeriod wp) {
        if (request == null) return null;

        return PlaceWorkingPeriodRule.builder()
            .occupationRule(occupationRule)
            .workingPeriod(wp)
            .personCount(request.getPersonCount())
            .build();
    }

    public void updateWorkingPeriodRuleEntity(PlaceWorkingPeriodRuleUpdateRequestDTO request, PlaceWorkingPeriodRule entity) {
        if (request == null || entity == null) return;

        if (request.getPersonCount() != null) entity.setPersonCount(request.getPersonCount());
    }

    public PlaceWorkingPeriodRuleResponseDTO toWorkingPeriodRuleResponseDTO(PlaceWorkingPeriodRule entity) {
        if (entity == null) return null;

        return PlaceWorkingPeriodRuleResponseDTO.builder()
            .id(entity.getId())
            .occupationRuleId(entity.getOccupationRule() != null ? entity.getOccupationRule().getId() : null)
            .workingPeriodId(entity.getWorkingPeriod() != null ? entity.getWorkingPeriod().getId() : null)
            .workingPeriodName(entity.getWorkingPeriod() != null ? entity.getWorkingPeriod().getName() : null)
            .personCount(entity.getPersonCount())
            .build();
    }

    // --- Place Occupation Rule ---
    public PlaceOccupationRule toOccupationRuleEntity(PlaceOccupationRuleCreateRequestDTO request, Place place, Occupation occupation) {
        if (request == null) return null;

        return PlaceOccupationRule.builder()
            .place(place)
            .weekDay(request.getWeekDay())
            .occupation(occupation)
            .build();
    }

    public void updateOccupationRuleEntity(PlaceOccupationRuleUpdateRequestDTO request, PlaceOccupationRule entity) {
        if (request == null || entity == null) return;

        if (request.getWeekDay() != null) entity.setWeekDay(request.getWeekDay());
    }

    public PlaceOccupationRuleResponseDTO toOccupationRuleResponseDTO(PlaceOccupationRule entity) {
        if (entity == null) return null;

        return PlaceOccupationRuleResponseDTO.builder()
            .id(entity.getId())
            .placeId(entity.getPlace() != null ? entity.getPlace().getId() : null)
            .weekDay(entity.getWeekDay())
            .occupationId(entity.getOccupation() != null ? entity.getOccupation().getId() : null)
            .occupationName(entity.getOccupation() != null ? entity.getOccupation().getName() : null)
            .build();
    }
}
