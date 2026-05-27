package project.office_workforce_service.service.common;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.office_workforce_service.mapper.PlaceRuleMapper;
import project.office_workforce_service.model.dto.request.PlaceScheduleRuleCreateRequestDTO;
import project.office_workforce_service.model.dto.request.PlaceScheduleRuleUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.PlaceScheduleRuleResponseDTO;
import project.office_workforce_service.model.entity.Place;
import project.office_workforce_service.model.entity.PlaceScheduleRule;
import project.office_workforce_service.service.manager.PlaceManagerService;
import project.office_workforce_service.service.manager.PlaceScheduleRuleManagerService;

@Service
public class PlaceScheduleRuleService {

    @Autowired
    private PlaceScheduleRuleManagerService ruleManager;
    @Autowired
    private PlaceManagerService placeManager;
    @Autowired
    private PlaceRuleMapper mapper;

    public PlaceScheduleRuleResponseDTO findByPlaceId(Long placeId) {
        return mapper.toScheduleRuleResponseDTO(ruleManager.findByPlaceId(placeId));
    }

    @Transactional
    public PlaceScheduleRuleResponseDTO create(PlaceScheduleRuleCreateRequestDTO requestDTO) {
        Place place = placeManager.getReferenceById(requestDTO.getPlaceId());
        PlaceScheduleRule entity = mapper.toScheduleRuleEntity(requestDTO, place);
        return mapper.toScheduleRuleResponseDTO(ruleManager.save(entity));
    }

    @Transactional
    public PlaceScheduleRuleResponseDTO update(Long id, PlaceScheduleRuleUpdateRequestDTO requestDTO) {
        PlaceScheduleRule existing = ruleManager.findById(id);
        mapper.updateScheduleRuleEntity(requestDTO, existing);
        return mapper.toScheduleRuleResponseDTO(ruleManager.save(existing));
    }
}