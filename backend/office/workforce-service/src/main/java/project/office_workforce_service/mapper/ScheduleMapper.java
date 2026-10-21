package project.office_workforce_service.mapper;

import org.springframework.stereotype.Component;
import project.office_workforce_service.model.dto.request.ScheduleCreateRequestDTO;
import project.office_workforce_service.model.dto.request.ScheduleUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.ScheduleResponseDTO;
import project.office_workforce_service.model.entity.Occupation;
import project.office_workforce_service.model.entity.Place;
import project.office_workforce_service.model.entity.Schedule;
import project.office_workforce_service.model.entity.Staff;
import project.office_workforce_service.model.entity.WorkingPeriod;

@Component
public class ScheduleMapper {

    public Schedule toEntity(ScheduleCreateRequestDTO request, Place place, Staff staff, WorkingPeriod workingPeriod, Occupation occupation) {
        if (request == null) return null;

        return Schedule.builder()
            .startAt(request.getStartAt())
            .endAt(request.getEndAt())
            .place(place)
            .staff(staff)
            .workingPeriod(workingPeriod)
            .occupation(occupation)
            .status(request.getStatus())
            .remark(request.getRemark())
            .build();
    }

    public void updateEntity(ScheduleUpdateRequestDTO request, Schedule entity, Place newPlace, Staff newStaff, WorkingPeriod newWorkingPeriod, Occupation newOccupation) {
        if (request == null || entity == null) return;

        if (request.getStartAt() != null) entity.setStartAt(request.getStartAt());
        if (request.getEndAt() != null) entity.setEndAt(request.getEndAt());
        if (newPlace != null) entity.setPlace(newPlace);
        if (newStaff != null) entity.setStaff(newStaff);
        if (newWorkingPeriod != null) entity.setWorkingPeriod(newWorkingPeriod);
        if (newOccupation != null) entity.setOccupation(newOccupation);
        if (request.getStatus() != null) entity.setStatus(request.getStatus());
        if (request.getRemark() != null) entity.setRemark(request.getRemark());
    }

    public ScheduleResponseDTO toResponseDTO(Schedule schedule) {
        if (schedule == null) return null;

        String staffName = (schedule.getStaff() != null && schedule.getStaff().getPerson() != null)
            ? schedule.getStaff().getPerson().getNameEnglish() : null;

        String staffNameChinese = (schedule.getStaff() != null && schedule.getStaff().getPerson() != null)
            ? schedule.getStaff().getPerson().getNameChinese() : null;

        String staffCustId = schedule.getStaff() != null ? schedule.getStaff().getCustId() : null;

        return ScheduleResponseDTO.builder()
            .id(schedule.getId())
            .startAt(schedule.getStartAt())
            .endAt(schedule.getEndAt())
            .placeId(schedule.getPlace() != null ? schedule.getPlace().getId() : null)
            .placeName(schedule.getPlace() != null ? schedule.getPlace().getName() : null)
            .staffId(schedule.getStaff() != null ? schedule.getStaff().getId() : null)
            .staffNameEnglish(staffName)
            .staffNameChinese(staffNameChinese)
            .staffCustId(staffCustId)
            .workingPeriodId(schedule.getWorkingPeriod() != null ? schedule.getWorkingPeriod().getId() : null)
            .workingPeriodName(schedule.getWorkingPeriod() != null ? schedule.getWorkingPeriod().getName() : null)
            .occupationId(schedule.getOccupation() != null ? schedule.getOccupation().getId() : null)
            .occupationName(schedule.getOccupation() != null ? schedule.getOccupation().getName() : null)
            .status(schedule.getStatus())
            .remark(schedule.getRemark())
            .build();
    }
}