package project.office_workforce_service.mapper;

import org.springframework.stereotype.Component;
import project.office_workforce_service.model.dto.object.StaffDetailDTO;
import project.office_workforce_service.model.entity.StaffDetail;

@Component
public class StaffDetailMapper {
    public StaffDetailDTO toStaffDetailDTO(StaffDetail staffDetail) {
        if (staffDetail == null) return null;
        return StaffDetailDTO.builder()
            .id(staffDetail.getId())
            .staffId(staffDetail.getStaff() != null ? staffDetail.getStaff().getId() : null)
            .maxWorkingHrs(staffDetail.getMaxWorkingHrs())
            .createdAt(staffDetail.getCreatedAt())
            .updatedAt(staffDetail.getUpdatedAt())
            .build();
    }
}
