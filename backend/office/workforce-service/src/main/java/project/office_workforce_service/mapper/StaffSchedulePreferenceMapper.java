package project.office_workforce_service.mapper;

import org.springframework.stereotype.Component;
import project.office_workforce_service.model.dto.request.StaffSchedulePreferenceCreateRequestDTO;
import project.office_workforce_service.model.dto.request.StaffSchedulePreferenceUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.StaffSchedulePreferenceResponseDTO;
import project.office_workforce_service.model.entity.Place;
import project.office_workforce_service.model.entity.Staff;
import project.office_workforce_service.model.entity.StaffSchedulePreference;
import project.office_workforce_service.model.entity.WorkingPeriod;

@Component
public class StaffSchedulePreferenceMapper {

    public StaffSchedulePreference toEntity(StaffSchedulePreferenceCreateRequestDTO request, Staff staff, Place place, WorkingPeriod wp) {
        if (request == null) return null;

        return StaffSchedulePreference.builder()
            .staff(staff)
            .place(place)
            .weekDay(request.getWeekDay())
            .workingPeriod(wp)
            .priorityIndex(request.getPriorityIndex() != null ? request.getPriorityIndex() : 0)
            .build();
    }

    public void updateEntity(StaffSchedulePreferenceUpdateRequestDTO request, StaffSchedulePreference entity, Place newPlace, WorkingPeriod newWp) {
        if (request == null || entity == null) return;

        if (newPlace != null) entity.setPlace(newPlace);
        if (newWp != null) entity.setWorkingPeriod(newWp);
        if (request.getWeekDay() != null) entity.setWeekDay(request.getWeekDay());
        if (request.getPriorityIndex() != null) entity.setPriorityIndex(request.getPriorityIndex());
    }

    public StaffSchedulePreferenceResponseDTO toResponseDTO(StaffSchedulePreference pref) {
        if (pref == null) return null;

        String staffName = (pref.getStaff() != null && pref.getStaff().getPerson() != null)
            ? pref.getStaff().getPerson().getNameEnglish() : null;

        return StaffSchedulePreferenceResponseDTO.builder()
            .id(pref.getId())
            .staffId(pref.getStaff() != null ? pref.getStaff().getId() : null)
            .staffName(staffName)
            .placeId(pref.getPlace() != null ? pref.getPlace().getId() : null)
            .placeName(pref.getPlace() != null ? pref.getPlace().getName() : null)
            .weekDay(pref.getWeekDay())
            .workingPeriodId(pref.getWorkingPeriod() != null ? pref.getWorkingPeriod().getId() : null)
            .workingPeriodName(pref.getWorkingPeriod() != null ? pref.getWorkingPeriod().getName() : null)
            .priorityIndex(pref.getPriorityIndex())
            .build();
    }
}