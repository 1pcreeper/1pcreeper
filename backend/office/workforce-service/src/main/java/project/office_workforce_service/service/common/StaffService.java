package project.office_workforce_service.service.common;

import jakarta.annotation.Nullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.office_workforce_service.mapper.*;
import project.office_workforce_service.model.dto.object.*;
import project.office_workforce_service.model.dto.request.StaffCreateRequestDTO;
import project.office_workforce_service.model.dto.request.StaffUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.StaffDetailResponseDTO;
import project.office_workforce_service.model.dto.response.StaffResponseDTO;
import project.office_workforce_service.model.entity.*;
import project.office_workforce_service.model.entity.enums.WorkType;
import project.office_workforce_service.service.manager.*;
import project.shared_office_starter.mapper.PaginationMapper;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

import java.util.List;

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
    private StaffDetailMapper staffDetailMapper;
    @Autowired
    private PaginationMapper paginationMapper;
    @Autowired
    private CompanyMapper companyMapper;
    @Autowired
    private PersonDetailManagerService personDetailManagerService;
    @Autowired
    private PersonMapper personMapper;
    @Autowired
    private PersonDetailMapper personDetailMapper;
    @Autowired
    private StaffOccupationManagerService staffOccupationManagerService;
    @Autowired
    private StaffSchedulePreferenceManagerService staffSchedulePreferenceManagerService;
    @Autowired
    private StaffOccupationMapper staffOccupationMapper;
    @Autowired
    private StaffSchedulePreferenceMapper staffSchedulePreferenceMapper;

    public PaginationBaseResponseDTO<StaffResponseDTO> search(
        @Nullable String q,
        @Nullable Long companyId,
        @Nullable Long orgId,
        @Nullable WorkType workType,
        @Nullable Boolean isActive,
        Pageable pageable) {

        return paginationMapper.toDTO(
            staffManagerService.searchStaff(q, companyId, orgId, workType, isActive, pageable),
            staff -> staffMapper.toResponseDTO(staff)
        );
    }

    public StaffResponseDTO findById(Long id) {
        Staff staff = staffManagerService.findById(id);
        return staffMapper.toResponseDTO(staff);
    }

    public StaffDetailResponseDTO findByIdInDetail(Long id) {
        Staff staff = staffManagerService.findById(id);
        StaffDetail staffDetail;
        PersonDetail personDetail;
        List<StaffOccupation> staffOccupations;
        List<StaffSchedulePreference> staffSchedulePreferences;
        try {
            staffDetail = staffDetailManagerService.findByStaffId(id);
        } catch (ResourceNotFoundException e) {
            staffDetail = null;
        }
        try {
            personDetail = personDetailManagerService.findByPersonId(staff.getPerson().getId());
        } catch (ResourceNotFoundException e) {
            personDetail = null;
        }
        try {
            staffOccupations = staffOccupationManagerService.findByStaffId(staff.getId());
        } catch (ResourceNotFoundException e) {
            staffOccupations = null;
        }
        try {
            staffSchedulePreferences = staffSchedulePreferenceManagerService.findByStaffId(staff.getId());
        } catch (ResourceNotFoundException e) {
            staffSchedulePreferences = null;
        }

        Company company = staff.getCompany();
        Person person = staff.getPerson();

        CompanyDTO companyDTO = companyMapper.toCompanyDTO(company);
        StaffDTO staffDTO = staffMapper.toStaffDTO(staff);
        StaffDetailDTO staffDetailDTO = staffDetailMapper.toStaffDetailDTO(staffDetail);
        PersonDTO personDTO = personMapper.toPersonDTO(person);
        PersonDetailDTO personDetailDTO = personDetailMapper.tpPersonDetailDTO(personDetail);
        List<StaffOccupationDTO> staffOccupationDTOs = staffOccupations
            .stream().map(so -> staffOccupationMapper.toStaffOccupationDTO(so)).toList();
        List<StaffSchedulePreferenceDTO> staffSchedulePreferenceDTOs = staffSchedulePreferences
            .stream().map(ssp -> staffSchedulePreferenceMapper.toStaffSchedulePreferenceDTO(ssp))
            .toList();

        return StaffDetailResponseDTO.builder()
            .company(companyDTO)
            .staff(staffDTO)
            .staffDetail(staffDetailDTO)
            .person(personDTO)
            .personDetail(personDetailDTO)
            .staffOccupations(staffOccupationDTOs)
            .schedulePreferences(staffSchedulePreferenceDTOs)
            .build();
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

        return staffMapper.toResponseDTO(savedStaff);
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

        return staffMapper.toResponseDTO(savedStaff);
    }

    public PaginationBaseResponseDTO<StaffResponseDTO> findAll(Pageable pageable, @Nullable Long companyId) {
        Page<Staff> staffs = companyId != null ?
            staffManagerService.findAllByCompanyIdAndIsActive(companyId, true, pageable)
            : staffManagerService.findAllByIsActive(true, pageable);
        return paginationMapper.toDTO(staffs, (s) -> staffMapper.toResponseDTO(s));
    }
    @Transactional
    public void delete(Long id){
        Staff existingStaff = staffManagerService.findById(id);
        existingStaff.setIsActive(false);
        staffManagerService.save(existingStaff);
    }
}