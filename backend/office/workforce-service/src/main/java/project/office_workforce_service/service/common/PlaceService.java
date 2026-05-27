package project.office_workforce_service.service.common;

import jakarta.annotation.Nullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.office_workforce_service.mapper.PlaceMapper;
import project.office_workforce_service.model.dto.request.PlaceCreateRequestDTO;
import project.office_workforce_service.model.dto.request.PlaceUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.PlaceResponseDTO;
import project.office_workforce_service.model.entity.Organization;
import project.office_workforce_service.model.entity.Place;
import project.office_workforce_service.service.manager.OrganizationManagerService;
import project.office_workforce_service.service.manager.PlaceManagerService;
import project.shared_office_starter.mapper.PaginationMapper;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

@Service
public class PlaceService {

    @Autowired
    private PlaceManagerService placeManagerService;
    @Autowired
    private OrganizationManagerService organizationManagerService;
    @Autowired
    private PlaceMapper placeMapper;
    @Autowired
    private PaginationMapper paginationMapper;

    public PaginationBaseResponseDTO<PlaceResponseDTO> search(
        @Nullable Long orgId,
        @Nullable String q,
        @Nullable Boolean isActive,
        Pageable pageable) {

        return paginationMapper.toDTO(
            placeManagerService.search(orgId, q, isActive, pageable),
            placeMapper::toResponseDTO
        );
    }

    public PlaceResponseDTO findById(Long id) {
        return placeMapper.toResponseDTO(placeManagerService.findById(id));
    }

    @Transactional
    public PlaceResponseDTO create(PlaceCreateRequestDTO requestDTO) {
        Organization org = organizationManagerService.getReferenceById(requestDTO.getOrgId());
        Place newPlace = placeMapper.toEntity(requestDTO, org);
        return placeMapper.toResponseDTO(placeManagerService.save(newPlace));
    }

    @Transactional
    public PlaceResponseDTO update(Long id, PlaceUpdateRequestDTO requestDTO) {
        Place existingPlace = placeManagerService.findById(id);
        placeMapper.updateEntity(requestDTO, existingPlace);
        return placeMapper.toResponseDTO(placeManagerService.save(existingPlace));
    }
}