package project.office_workforce_service.service.common;

import jakarta.annotation.Nullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.office_workforce_service.mapper.StaffMapper;
import project.office_workforce_service.model.dto.request.StaffCreateRequestDTO;
import project.office_workforce_service.model.dto.request.StaffUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.StaffResponseDTO;
import project.office_workforce_service.model.entity.Company;
import project.office_workforce_service.model.entity.Organization;
import project.office_workforce_service.model.entity.Person;
import project.office_workforce_service.model.entity.Staff;
import project.office_workforce_service.model.entity.StaffDetail;
import project.office_workforce_service.model.entity.enums.WorkType;
import project.office_workforce_service.service.manager.*;
import project.shared_office_starter.mapper.PaginationMapper;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

@Service
public class StaffService {

    @Autowired
    private StaffManagerService staffManagerService;
    @Autowired
    private StaffDetailManagerService staffDetailManagerService;
    @Autowired
    private CompanyManagerService companyManagerService;
    @Autowired
    private PersonManagerService personManagerService;
    @Autowired
    private OrganizationManagerService organizationManagerService;
    @Autowired
    private StaffMapper staffMapper;
    @Autowired
    private PaginationMapper paginationMapper;

    public PaginationBaseResponseDTO<StaffResponseDTO> search(
        @Nullable String q,
        @Nullable Long companyId,
        @Nullable Long orgId,
        @Nullable WorkType workType,
        @Nullable Boolean isActive,
        Pageable pageable) {

        return paginationMapper.toDTO(
            staffManagerService.searchStaff(q, companyId, orgId, workType, isActive, pageable),
            staff -> staffMapper.toResponseDTO(staff, null)
        );
    }

    public StaffResponseDTO findById(Long id) {
        Staff staff = staffManagerService.findById(id);
        StaffDetail detail = staffDetailManagerService.findByStaffId(id);
        return staffMapper.toResponseDTO(staff, detail);
    }

    @Transactional
    public StaffResponseDTO create(StaffCreateRequestDTO requestDTO) {
        Company company = companyManagerService.getReferenceById(requestDTO.getCompanyId());
        Person person = personManagerService.getReferenceById(requestDTO.getPersonId());
        Organization org = organizationManagerService.getReferenceById(requestDTO.getOrgId());

        Staff newStaff = staffMapper.toEntity(requestDTO, company, person, org);
        Staff savedStaff = staffManagerService.save(newStaff);

        StaffDetail detail = staffMapper.toDetailEntity(requestDTO.getDetails(), savedStaff);
        StaffDetail savedDetail = staffDetailManagerService.save(detail);

        return staffMapper.toResponseDTO(savedStaff, savedDetail);
    }

    @Transactional
    public StaffResponseDTO update(Long id, StaffUpdateRequestDTO requestDTO) {
        Staff existingStaff = staffManagerService.findById(id);

        Organization newOrg = null;
        if (requestDTO.getOrgId() != null) {
            newOrg = organizationManagerService.getReferenceById(requestDTO.getOrgId());
        }

        staffMapper.updateEntity(requestDTO, existingStaff, newOrg);
        Staff savedStaff = staffManagerService.save(existingStaff);

        StaffDetail savedDetail = null;
        if (requestDTO.getDetails() != null) {
            try {
                savedDetail = staffDetailManagerService.findByStaffId(id);
            } catch (Exception e) {
                savedDetail = StaffDetail.builder().staff(savedStaff).build();
            }
            if (requestDTO.getDetails().getMaxWorkingHrs() != null) {
                savedDetail.setMaxWorkingHrs(requestDTO.getDetails().getMaxWorkingHrs());
            }
            savedDetail = staffDetailManagerService.save(savedDetail);
        }

        return staffMapper.toResponseDTO(savedStaff, savedDetail);
    }
}