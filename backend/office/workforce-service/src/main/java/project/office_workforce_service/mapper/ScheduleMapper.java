package project.office_workforce_service.mapper;

import org.springframework.stereotype.Component;
import project.office_workforce_service.model.dto.request.ScheduleCreateRequestDTO;
import project.office_workforce_service.model.dto.request.ScheduleUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.ScheduleResponseDTO;
import project.office_workforce_service.model.entity.Place;
import project.office_workforce_service.model.entity.Schedule;
import project.office_workforce_service.model.entity.Staff;

@Component
public class ScheduleMapper {

    public Schedule toEntity(ScheduleCreateRequestDTO request, Place place, Staff staff) {
        if (request == null) return null;

        return Schedule.builder()
            .startAt(request.getStartAt())
            .endAt(request.getEndAt())
            .place(place)
            .staff(staff)
            .status(request.getStatus())
            .remark(request.getRemark())
            .build();
    }

    public void updateEntity(ScheduleUpdateRequestDTO request, Schedule entity, Place newPlace, Staff newStaff) {
        if (request == null || entity == null) return;

        if (request.getStartAt() != null) entity.setStartAt(request.getStartAt());
        if (request.getEndAt() != null) entity.setEndAt(request.getEndAt());
        if (newPlace != null) entity.setPlace(newPlace);
        if (newStaff != null) entity.setStaff(newStaff);
        if (request.getStatus() != null) entity.setStatus(request.getStatus());
        if (request.getRemark() != null) entity.setRemark(request.getRemark());
    }

    public ScheduleResponseDTO toResponseDTO(Schedule schedule) {
        if (schedule == null) return null;

        String staffName = (schedule.getStaff() != null && schedule.getStaff().getPerson() != null)
            ? schedule.getStaff().getPerson().getNameEnglish() : null;

        String staffCustId = schedule.getStaff() != null ? schedule.getStaff().getCustId() : null;

        return ScheduleResponseDTO.builder()
            .id(schedule.getId())
            .startAt(schedule.getStartAt())
            .endAt(schedule.getEndAt())
            .placeId(schedule.getPlace() != null ? schedule.getPlace().getId() : null)
            .placeName(schedule.getPlace() != null ? schedule.getPlace().getName() : null)
            .staffId(schedule.getStaff() != null ? schedule.getStaff().getId() : null)
            .staffNameEnglish(staffName)
            .staffCustId(staffCustId)
            .status(schedule.getStatus())
            .remark(schedule.getRemark())
            .build();
    }
}