package project.office_workforce_service.service.common;

import jakarta.annotation.Nullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.office_workforce_service.mapper.ScheduleMapper;
import project.office_workforce_service.model.dto.request.ScheduleCreateRequestDTO;
import project.office_workforce_service.model.dto.request.ScheduleStatusUpdateRequestDTO;
import project.office_workforce_service.model.dto.request.ScheduleUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.ScheduleResponseDTO;
import project.office_workforce_service.model.entity.Place;
import project.office_workforce_service.model.entity.Schedule;
import project.office_workforce_service.model.entity.Staff;
import project.office_workforce_service.model.entity.enums.ScheduleStatus;
import project.office_workforce_service.service.manager.PlaceManagerService;
import project.office_workforce_service.service.manager.ScheduleManagerService;
import project.office_workforce_service.service.manager.StaffManagerService;
import project.shared_office_starter.mapper.PaginationMapper;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

import java.time.LocalDateTime;

@Service
public class ScheduleService {

    @Autowired
    private ScheduleManagerService scheduleManagerService;
    @Autowired
    private PlaceManagerService placeManagerService;
    @Autowired
    private StaffManagerService staffManagerService;
    @Autowired
    private ScheduleMapper mapper;
    @Autowired
    private PaginationMapper paginationMapper;

    public PaginationBaseResponseDTO<ScheduleResponseDTO> search(
        @Nullable Long placeId,
        @Nullable Long staffId,
        @Nullable ScheduleStatus status,
        @Nullable LocalDateTime startFrom,
        @Nullable LocalDateTime endTo,
        Pageable pageable) {

        return paginationMapper.toDTO(
            scheduleManagerService.search(placeId, staffId, status, startFrom, endTo, pageable),
            mapper::toResponseDTO
        );
    }

    public ScheduleResponseDTO findById(Long id) {
        return mapper.toResponseDTO(scheduleManagerService.findById(id));
    }

    @Transactional
    public ScheduleResponseDTO create(ScheduleCreateRequestDTO requestDTO) {
        Place place = placeManagerService.getReferenceById(requestDTO.getPlaceId());
        Staff staff = staffManagerService.getReferenceById(requestDTO.getStaffId());

        Schedule entity = mapper.toEntity(requestDTO, place, staff);
        return mapper.toResponseDTO(scheduleManagerService.save(entity));
    }

    @Transactional
    public ScheduleResponseDTO update(Long id, ScheduleUpdateRequestDTO requestDTO) {
        Schedule existing = scheduleManagerService.findById(id);

        Place newPlace = null;
        if (requestDTO.getPlaceId() != null) {
            newPlace = placeManagerService.getReferenceById(requestDTO.getPlaceId());
        }

        Staff newStaff = null;
        if (requestDTO.getStaffId() != null) {
            newStaff = staffManagerService.getReferenceById(requestDTO.getStaffId());
        }

        mapper.updateEntity(requestDTO, existing, newPlace, newStaff);
        return mapper.toResponseDTO(scheduleManagerService.save(existing));
    }

    @Transactional
    public ScheduleResponseDTO updateStatus(Long id, ScheduleStatusUpdateRequestDTO requestDTO) {
        Schedule existing = scheduleManagerService.findById(id);
        existing.setStatus(requestDTO.getStatus());
        return mapper.toResponseDTO(scheduleManagerService.save(existing));
    }
}