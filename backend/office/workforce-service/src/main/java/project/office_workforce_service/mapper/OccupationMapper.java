package project.office_workforce_service.mapper;

import org.springframework.stereotype.Component;
import project.office_workforce_service.model.dto.request.OccupationCreateRequestDTO;
import project.office_workforce_service.model.dto.request.OccupationUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.OccupationResponseDTO;
import project.office_workforce_service.model.entity.Occupation;
import project.office_workforce_service.model.entity.Organization;

@Component
public class OccupationMapper {

    public Occupation toEntity(OccupationCreateRequestDTO request, Organization org) {
        if (request == null) return null;

        return Occupation.builder()
            .org(org)
            .name(request.getName())
            .isActive(true)
            .build();
    }

    public void updateEntity(OccupationUpdateRequestDTO request, Occupation entity) {
        if (request == null || entity == null) return;

        if (request.getName() != null) entity.setName(request.getName());
        if (request.getIsActive() != null) entity.setIsActive(request.getIsActive());
    }

    public OccupationResponseDTO toResponseDTO(Occupation occupation) {
        if (occupation == null) return null;

        return OccupationResponseDTO.builder()
            .id(occupation.getId())
            .orgId(occupation.getOrg() != null ? occupation.getOrg().getId() : null)
            .name(occupation.getName())
            .isActive(occupation.getIsActive())
            .build();
    }
}