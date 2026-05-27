package project.office_workforce_service.service.common;

import jakarta.annotation.Nullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.office_workforce_service.mapper.PlaceRuleMapper;
import project.office_workforce_service.model.dto.request.PlaceWorkingPeriodRuleCreateRequestDTO;
import project.office_workforce_service.model.dto.request.PlaceWorkingPeriodRuleUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.PlaceWorkingPeriodRuleResponseDTO;
import project.office_workforce_service.model.entity.Place;
import project.office_workforce_service.model.entity.PlaceWorkingPeriodRule;
import project.office_workforce_service.model.entity.WorkingPeriod;
import project.office_workforce_service.service.manager.PlaceManagerService;
import project.office_workforce_service.service.manager.PlaceWorkingPeriodRuleManagerService;
import project.office_workforce_service.service.manager.WorkingPeriodManagerService;
import project.shared_office_starter.mapper.PaginationMapper;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

@Service
public class PlaceWorkingPeriodRuleService {

    @Autowired
    private PlaceWorkingPeriodRuleManagerService ruleManager;
    @Autowired
    private PlaceManagerService placeManager;
    @Autowired
    private WorkingPeriodManagerService wpManager;
    @Autowired
    private PlaceRuleMapper mapper;
    @Autowired
    private PaginationMapper paginationMapper;

    public PaginationBaseResponseDTO<PlaceWorkingPeriodRuleResponseDTO> search(
        @Nullable Long placeId,
        @Nullable Long workingPeriodId,
        Pageable pageable) {

        return paginationMapper.toDTO(
            ruleManager.search(placeId, workingPeriodId, pageable),
            mapper::toWorkingPeriodRuleResponseDTO
        );
    }

    @Transactional
    public PlaceWorkingPeriodRuleResponseDTO create(PlaceWorkingPeriodRuleCreateRequestDTO requestDTO) {
        Place place = placeManager.getReferenceById(requestDTO.getPlaceId());
        WorkingPeriod wp = wpManager.getReferenceById(requestDTO.getWorkingPeriodId());

        PlaceWorkingPeriodRule entity = mapper.toWorkingPeriodRuleEntity(requestDTO, place, wp);
        return mapper.toWorkingPeriodRuleResponseDTO(ruleManager.save(entity));
    }

    @Transactional
    public PlaceWorkingPeriodRuleResponseDTO update(Long id, PlaceWorkingPeriodRuleUpdateRequestDTO requestDTO) {
        PlaceWorkingPeriodRule existing = ruleManager.findById(id);
        mapper.updateWorkingPeriodRuleEntity(requestDTO, existing);
        return mapper.toWorkingPeriodRuleResponseDTO(ruleManager.save(existing));
    }
}