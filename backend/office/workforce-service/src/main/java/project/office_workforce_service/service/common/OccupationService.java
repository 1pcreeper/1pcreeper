package project.office_workforce_service.service.common;

import jakarta.annotation.Nullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.office_workforce_service.mapper.OccupationMapper;
import project.office_workforce_service.model.dto.request.OccupationCreateRequestDTO;
import project.office_workforce_service.model.dto.request.OccupationUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.OccupationResponseDTO;
import project.office_workforce_service.model.entity.Occupation;
import project.office_workforce_service.model.entity.Organization;
import project.office_workforce_service.service.manager.OccupationManagerService;
import project.office_workforce_service.service.manager.OrganizationManagerService;
import project.shared_office_starter.mapper.PaginationMapper;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

@Service
public class OccupationService {

    @Autowired
    private OccupationManagerService occupationManagerService;
    @Autowired
    private OrganizationManagerService organizationManagerService;
    @Autowired
    private OccupationMapper occupationMapper;
    @Autowired
    private PaginationMapper paginationMapper;

    public PaginationBaseResponseDTO<OccupationResponseDTO> search(
        @Nullable Long orgId,
        @Nullable String q,
        @Nullable Boolean isActive,
        Pageable pageable) {

        return paginationMapper.toDTO(
            occupationManagerService.search(orgId, q, isActive, pageable),
            occupationMapper::toResponseDTO
        );
    }

    public OccupationResponseDTO findById(Long id) {
        return occupationMapper.toResponseDTO(occupationManagerService.findById(id));
    }

    @Transactional
    public OccupationResponseDTO create(OccupationCreateRequestDTO requestDTO) {
        Organization org = organizationManagerService.getReferenceById(requestDTO.getOrgId());
        Occupation newOccupation = occupationMapper.toEntity(requestDTO, org);
        return occupationMapper.toResponseDTO(occupationManagerService.save(newOccupation));
    }

    @Transactional
    public OccupationResponseDTO update(Long id, OccupationUpdateRequestDTO requestDTO) {
        Occupation existingOccupation = occupationManagerService.findById(id);
        occupationMapper.updateEntity(requestDTO, existingOccupation);
        return occupationMapper.toResponseDTO(occupationManagerService.save(existingOccupation));
    }
}