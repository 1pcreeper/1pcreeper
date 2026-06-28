package project.office_workforce_service.mapper;

import org.springframework.stereotype.Component;
import project.office_workforce_service.model.dto.object.StaffDTO;
import project.office_workforce_service.model.dto.request.StaffCreateRequestDTO;
import project.office_workforce_service.model.dto.request.StaffDetailRequestDTO;
import project.office_workforce_service.model.dto.request.StaffUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.StaffDetailResponseDTO;
import project.office_workforce_service.model.dto.response.StaffResponseDTO;
import project.office_workforce_service.model.entity.Company;
import project.office_workforce_service.model.entity.Organization;
import project.office_workforce_service.model.entity.Person;
import project.office_workforce_service.model.entity.Staff;
import project.office_workforce_service.model.entity.StaffDetail;
import project.office_workforce_service.model.entity.enums.WorkType;

import java.time.LocalDateTime;

@Component
public class StaffMapper {

    public Staff toEntity(StaffCreateRequestDTO request, Company company, Person person, Organization org) {
        if (request == null) return null;

        return Staff.builder()
            .company(company)
            .person(person)
            .org(org)
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

    public void updateEntity(StaffUpdateRequestDTO request, Staff entity, Organization newOrg) {
        if (request == null || entity == null) return;

        if (newOrg != null) entity.setOrg(newOrg);
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
            .orgId(staff.getOrg() != null ? staff.getOrg().getId() : null)
            .orgName(staff.getOrg() != null ? staff.getOrg().getName() : null)
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
            .orgId(staff.getOrg() != null ? staff.getOrg().getId() : null)
            .orgName(staff.getOrg()!=null ? staff.getOrg().getName():null)
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