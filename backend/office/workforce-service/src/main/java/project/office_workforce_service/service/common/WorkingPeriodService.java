package project.office_workforce_service.service.common;

import jakarta.annotation.Nullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.office_workforce_service.mapper.WorkingPeriodMapper;
import project.office_workforce_service.model.dto.request.WorkingPeriodCreateRequestDTO;
import project.office_workforce_service.model.dto.request.WorkingPeriodUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.WorkingPeriodResponseDTO;
import project.office_workforce_service.model.entity.Organization;
import project.office_workforce_service.model.entity.WorkingPeriod;
import project.office_workforce_service.service.manager.OrganizationManagerService;
import project.office_workforce_service.service.manager.WorkingPeriodManagerService;
import project.shared_office_starter.mapper.PaginationMapper;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

import java.time.LocalTime;

@Service
public class WorkingPeriodService {

    @Autowired
    private WorkingPeriodManagerService workingPeriodManagerService;
    @Autowired
    private OrganizationManagerService organizationManagerService;
    @Autowired
    private WorkingPeriodMapper workingPeriodMapper;
    @Autowired
    private PaginationMapper paginationMapper;

    public PaginationBaseResponseDTO<WorkingPeriodResponseDTO> search(
        @Nullable Long orgId,
        @Nullable String q,
        @Nullable LocalTime startFrom,
        @Nullable LocalTime endTo,
        @Nullable Boolean isActive,
        Pageable pageable) {

        return paginationMapper.toDTO(
            workingPeriodManagerService.search(orgId, q, startFrom, endTo, isActive, pageable),
            workingPeriodMapper::toResponseDTO
        );
    }

    public WorkingPeriodResponseDTO findById(Long id) {
        return workingPeriodMapper.toResponseDTO(workingPeriodManagerService.findById(id));
    }

    @Transactional
    public WorkingPeriodResponseDTO create(WorkingPeriodCreateRequestDTO requestDTO) {
        Organization org = organizationManagerService.getReferenceById(requestDTO.getOrgId());
        WorkingPeriod newWP = workingPeriodMapper.toEntity(requestDTO, org);
        return workingPeriodMapper.toResponseDTO(workingPeriodManagerService.save(newWP));
    }

    @Transactional
    public WorkingPeriodResponseDTO update(Long id, WorkingPeriodUpdateRequestDTO requestDTO) {
        WorkingPeriod existingWP = workingPeriodManagerService.findById(id);
        workingPeriodMapper.updateEntity(requestDTO, existingWP);
        return workingPeriodMapper.toResponseDTO(workingPeriodManagerService.save(existingWP));
    }
}