package project.office_workforce_service.mapper;

import org.springframework.stereotype.Component;
import project.office_workforce_service.model.dto.object.StaffDTO;
import project.office_workforce_service.model.dto.request.StaffCreateRequestDTO;
import project.office_workforce_service.model.dto.request.StaffDetailRequestDTO;
import project.office_workforce_service.model.dto.request.StaffUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.StaffResponseDTO;
import project.office_workforce_service.model.entity.*;
import project.office_workforce_service.model.entity.Department;

@Component
public class StaffMapper {

    public Staff toEntity(StaffCreateRequestDTO request, Company company, Person person, Department org) {
        if (request == null) return null;

        return Staff.builder()
            .company(company)
            .person(person)
            .department(org)
            .custId(request.getCustId())
            .type(request.getType())
            .isActive(true)
            .build();
    }

    public StaffDetail toDetailEntity(StaffDetailRequestDTO request, Staff staff) {
        if (request == null || staff == null) return null;

        return StaffDetail.builder()
            .staff(staff)
            .maxWorkingHrs(request.getMaxWorkingHrs())
            .build();
    }

    public void updateEntity(StaffUpdateRequestDTO request, Staff entity, Department newOrg) {
        if (request == null || entity == null) return;

        if (newOrg != null) entity.setDepartment(newOrg);
        if (request.getCustId() != null) entity.setCustId(request.getCustId());
        if (request.getType() != null) entity.setType(request.getType());
        entity.setIsActive(true);
    }

    public StaffResponseDTO toResponseDTO(Staff staff) {
        if (staff == null) return null;

        return StaffResponseDTO.builder()
            .id(staff.getId())
            .personId(staff.getPerson() != null ? staff.getPerson().getId() : null)
            .personNameEnglish(staff.getPerson() != null ? staff.getPerson().getNameEnglish() : null)
            .personNameChinese(staff.getPerson() != null ? staff.getPerson().getNameChinese() : null)
            .departId(staff.getDepartment() != null ? staff.getDepartment().getId() : null)
            .departName(staff.getDepartment() != null ? staff.getDepartment().getName() : null)
            .custId(staff.getCustId())
            .type(staff.getType())
            .isActive(staff.getIsActive())
            .build();
    }

    public StaffDTO toStaffDTO(Staff staff) {
        if (staff == null) return null;

        return StaffDTO.builder()
            .id(staff.getId())
            .companyId(staff.getCompany() != null ? staff.getCompany().getId() : null)
            .companyName(getCompanyNameChineseOrEnglish(staff))
            .personId(staff.getPerson() != null ? staff.getPerson().getId() : null)
            .departId(staff.getDepartment() != null ? staff.getDepartment().getId() : null)
            .departName(staff.getDepartment()!=null ? staff.getDepartment().getName():null)
            .custId(staff.getCustId())
            .type(staff.getType())
            .isActive(staff.getIsActive())
            .build();
    } 
    private String getCompanyNameChineseOrEnglish(Staff staff){
        if(staff.getCompany().getNameChinese()!=null){
            return staff.getCompany().getNameChinese();
        }
        if(staff.getCompany().getNameEnglish()!=null){
            return staff.getCompany().getNameEnglish();
        }
        return null;
    }
}