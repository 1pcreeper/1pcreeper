package project.office_workforce_service.service.common;

import jakarta.annotation.Nullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.office_workforce_service.mapper.StaffSchedulePreferenceMapper;
import project.office_workforce_service.model.dto.request.StaffSchedulePreferenceCreateRequestDTO;
import project.office_workforce_service.model.dto.request.StaffSchedulePreferenceUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.StaffSchedulePreferenceResponseDTO;
import project.office_workforce_service.model.entity.Place;
import project.office_workforce_service.model.entity.Staff;
import project.office_workforce_service.model.entity.StaffSchedulePreference;
import project.office_workforce_service.model.entity.WorkingPeriod;
import project.office_workforce_service.service.manager.PlaceManagerService;
import project.office_workforce_service.service.manager.StaffManagerService;
import project.office_workforce_service.service.manager.StaffSchedulePreferenceManagerService;
import project.office_workforce_service.service.manager.WorkingPeriodManagerService;
import project.shared_office_starter.mapper.PaginationMapper;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

@Service
public class StaffSchedulePreferenceService {

    @Autowired
    private StaffSchedulePreferenceManagerService preferenceManagerService;
    @Autowired
    private StaffManagerService staffManagerService;
    @Autowired
    private PlaceManagerService placeManagerService;
    @Autowired
    private WorkingPeriodManagerService workingPeriodManagerService;
    @Autowired
    private StaffSchedulePreferenceMapper mapper;
    @Autowired
    private PaginationMapper paginationMapper;

    public PaginationBaseResponseDTO<StaffSchedulePreferenceResponseDTO> search(
        @Nullable Long staffId,
        @Nullable Long placeId,
        @Nullable Integer weekDay,
        Pageable pageable) {

        return paginationMapper.toDTO(
            preferenceManagerService.search(staffId, placeId, weekDay, pageable),
            mapper::toResponseDTO
        );
    }

    public StaffSchedulePreferenceResponseDTO findById(Long id) {
        return mapper.toResponseDTO(preferenceManagerService.findById(id));
    }

    @Transactional
    public StaffSchedulePreferenceResponseDTO create(StaffSchedulePreferenceCreateRequestDTO requestDTO) {
        Staff staff = staffManagerService.getReferenceById(requestDTO.getStaffId());
        Place place = placeManagerService.getReferenceById(requestDTO.getPlaceId());
        WorkingPeriod wp = workingPeriodManagerService.getReferenceById(requestDTO.getWorkingPeriodId());

        StaffSchedulePreference entity = mapper.toEntity(requestDTO, staff, place, wp);
        return mapper.toResponseDTO(preferenceManagerService.save(entity));
    }

    @Transactional
    public StaffSchedulePreferenceResponseDTO update(Long id, StaffSchedulePreferenceUpdateRequestDTO requestDTO) {
        StaffSchedulePreference existing = preferenceManagerService.findById(id);

        Place newPlace = null;
        if (requestDTO.getPlaceId() != null) {
            newPlace = placeManagerService.getReferenceById(requestDTO.getPlaceId());
        }

        WorkingPeriod newWp = null;
        if (requestDTO.getWorkingPeriodId() != null) {
            newWp = workingPeriodManagerService.getReferenceById(requestDTO.getWorkingPeriodId());
        }

        mapper.updateEntity(requestDTO, existing, newPlace, newWp);
        return mapper.toResponseDTO(preferenceManagerService.save(existing));
    }
}