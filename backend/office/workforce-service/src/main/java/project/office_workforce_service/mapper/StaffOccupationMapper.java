package project.office_workforce_service.mapper;

import org.springframework.stereotype.Component;
import project.office_workforce_service.model.dto.request.StaffOccupationCreateRequestDTO;
import project.office_workforce_service.model.dto.request.StaffOccupationUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.StaffOccupationResponseDTO;
import project.office_workforce_service.model.entity.Occupation;
import project.office_workforce_service.model.entity.Staff;
import project.office_workforce_service.model.entity.StaffOccupation;

@Component
public class StaffOccupationMapper {

    public StaffOccupation toEntity(StaffOccupationCreateRequestDTO request, Staff staff, Occupation occupation) {
        if (request == null) return null;

        return StaffOccupation.builder()
            .staff(staff)
            .occupation(occupation)
            .remark(request.getRemark())
            .build();
    }

    public void updateEntity(StaffOccupationUpdateRequestDTO request, StaffOccupation entity, Occupation newOccupation) {
        if (request == null || entity == null) return;

        if (newOccupation != null) entity.setOccupation(newOccupation);
        if (request.getRemark() != null) entity.setRemark(request.getRemark());
    }

    public StaffOccupationResponseDTO toResponseDTO(StaffOccupation so) {
        if (so == null) return null;

        return StaffOccupationResponseDTO.builder()
            .id(so.getId())
            .staffId(so.getStaff() != null ? so.getStaff().getId() : null)
            .occupationId(so.getOccupation() != null ? so.getOccupation().getId() : null)
            .occupationName(so.getOccupation() != null ? so.getOccupation().getName() : null)
            .remark(so.getRemark())
            .build();
    }
}