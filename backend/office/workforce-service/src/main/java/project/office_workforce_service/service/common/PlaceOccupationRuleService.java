package project.office_workforce_service.service.common;

import jakarta.annotation.Nullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.office_workforce_service.mapper.PlaceRuleMapper;
import project.office_workforce_service.model.dto.request.PlaceOccupationRuleCreateRequestDTO;
import project.office_workforce_service.model.dto.request.PlaceOccupationRuleUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.PlaceOccupationRuleResponseDTO;
import project.office_workforce_service.model.entity.Occupation;
import project.office_workforce_service.model.entity.Place;
import project.office_workforce_service.model.entity.PlaceOccupationRule;
import project.office_workforce_service.service.manager.OccupationManagerService;
import project.office_workforce_service.service.manager.PlaceManagerService;
import project.office_workforce_service.service.manager.PlaceOccupationRuleManagerService;
import project.shared_office_starter.mapper.PaginationMapper;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

@Service
public class PlaceOccupationRuleService {

    @Autowired
    private PlaceOccupationRuleManagerService ruleManager;
    @Autowired
    private PlaceManagerService placeManager;
    @Autowired
    private OccupationManagerService occupationManager;
    @Autowired
    private PlaceRuleMapper mapper;
    @Autowired
    private PaginationMapper paginationMapper;

    public PaginationBaseResponseDTO<PlaceOccupationRuleResponseDTO> search(
        @Nullable Long placeId,
        @Nullable Long occupationId,
        Pageable pageable) {

        return paginationMapper.toDTO(
            ruleManager.search(placeId, occupationId, pageable),
            mapper::toOccupationRuleResponseDTO
        );
    }

    @Transactional
    public PlaceOccupationRuleResponseDTO create(PlaceOccupationRuleCreateRequestDTO requestDTO) {
        Place place = placeManager.getReferenceById(requestDTO.getPlaceId());
        Occupation occ = occupationManager.getReferenceById(requestDTO.getOccupationId());

        PlaceOccupationRule entity = mapper.toOccupationRuleEntity(requestDTO, place, occ);
        return mapper.toOccupationRuleResponseDTO(ruleManager.save(entity));
    }

    @Transactional
    public PlaceOccupationRuleResponseDTO update(Long id, PlaceOccupationRuleUpdateRequestDTO requestDTO) {
        PlaceOccupationRule existing = ruleManager.findById(id);
        mapper.updateOccupationRuleEntity(requestDTO, existing);
        return mapper.toOccupationRuleResponseDTO(ruleManager.save(existing));
    }
}