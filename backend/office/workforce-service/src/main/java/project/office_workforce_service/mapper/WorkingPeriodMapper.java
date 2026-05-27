package project.office_workforce_service.mapper;

import org.springframework.stereotype.Component;
import project.office_workforce_service.model.dto.request.WorkingPeriodCreateRequestDTO;
import project.office_workforce_service.model.dto.request.WorkingPeriodUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.WorkingPeriodResponseDTO;
import project.office_workforce_service.model.entity.Organization;
import project.office_workforce_service.model.entity.WorkingPeriod;

@Component
public class WorkingPeriodMapper {

    public WorkingPeriod toEntity(WorkingPeriodCreateRequestDTO request, Organization org) {
        if (request == null) return null;

        return WorkingPeriod.builder()
            .org(org)
            .startAt(request.getStartAt())
            .endAt(request.getEndAt())
            .name(request.getName())
            .isActive(true)
            .build();
    }

    public void updateEntity(WorkingPeriodUpdateRequestDTO request, WorkingPeriod entity) {
        if (request == null || entity == null) return;

        if (request.getStartAt() != null) entity.setStartAt(request.getStartAt());
        if (request.getEndAt() != null) entity.setEndAt(request.getEndAt());
        if (request.getName() != null) entity.setName(request.getName());
        if (request.getIsActive() != null) entity.setIsActive(request.getIsActive());
    }

    public WorkingPeriodResponseDTO toResponseDTO(WorkingPeriod wp) {
        if (wp == null) return null;

        return WorkingPeriodResponseDTO.builder()
            .id(wp.getId())
            .orgId(wp.getOrg() != null ? wp.getOrg().getId() : null)
            .startAt(wp.getStartAt())
            .endAt(wp.getEndAt())
            .name(wp.getName())
            .isActive(wp.getIsActive())
            .build();
    }
}