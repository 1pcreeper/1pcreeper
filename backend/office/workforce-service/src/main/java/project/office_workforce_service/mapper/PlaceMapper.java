package project.office_workforce_service.mapper;

import org.springframework.stereotype.Component;
import project.office_workforce_service.model.dto.request.PlaceCreateRequestDTO;
import project.office_workforce_service.model.dto.request.PlaceUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.PlaceResponseDTO;
import project.office_workforce_service.model.entity.Organization;
import project.office_workforce_service.model.entity.Place;

@Component
public class PlaceMapper {

    public Place toEntity(PlaceCreateRequestDTO request, Organization org) {
        if (request == null) return null;

        return Place.builder()
            .org(org)
            .name(request.getName())
            .address(request.getAddress())
            .isActive(true)
            .build();
    }

    public void updateEntity(PlaceUpdateRequestDTO request, Place entity) {
        if (request == null || entity == null) return;

        if (request.getName() != null) entity.setName(request.getName());
        if (request.getAddress() != null) entity.setAddress(request.getAddress());
        if (request.getIsActive() != null) entity.setIsActive(request.getIsActive());
    }

    public PlaceResponseDTO toResponseDTO(Place place) {
        if (place == null) return null;

        return PlaceResponseDTO.builder()
            .id(place.getId())
            .orgId(place.getOrg() != null ? place.getOrg().getId() : null)
            .orgName(place.getOrg() != null ? place.getOrg().getName() : null)
            .name(place.getName())
            .address(place.getAddress())
            .isActive(place.getIsActive())
            .build();
    }
}