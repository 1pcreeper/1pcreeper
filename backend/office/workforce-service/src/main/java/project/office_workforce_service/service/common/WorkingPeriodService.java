package project.office_workforce_service.service.common;

import jakarta.annotation.Nullable;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.office_workforce_service.mapper.WorkingPeriodMapper;
import project.office_workforce_service.model.dto.request.WorkingPeriodCreateRequestDTO;
import project.office_workforce_service.model.dto.request.WorkingPeriodUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.WorkingPeriodResponseDTO;
import project.office_workforce_service.model.entity.Department;
import project.office_workforce_service.model.entity.WorkingPeriod;
import project.office_workforce_service.service.checker.WorkingPeriodCheckerService;
import project.office_workforce_service.service.manager.DepartmentManagerService;
import project.office_workforce_service.service.manager.WorkingPeriodManagerService;
import project.shared_office_starter.mapper.PaginationMapper;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;
import project.shared_office_starter.model.exception.DatabaseUpdateFailureException;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

import java.time.LocalTime;

@Service
public class WorkingPeriodService {

    @Autowired
    private WorkingPeriodManagerService workingPeriodManagerService;
    @Autowired
    private DepartmentManagerService departmentManagerService;
    @Autowired
    private WorkingPeriodCheckerService workingPeriodCheckerService;
    @Autowired
    private WorkingPeriodMapper workingPeriodMapper;
    @Autowired
    private PaginationMapper paginationMapper;
    @Autowired
    private EntityManager entityManager;

    public PaginationBaseResponseDTO<WorkingPeriodResponseDTO> search(
        @Nullable Long departId,
        @Nullable String q,
        @Nullable LocalTime startFrom,
        @Nullable LocalTime endTo,
        @Nullable Boolean isActive,
        Pageable pageable) {

        return paginationMapper.toDTO(
            workingPeriodManagerService.search(departId, q, startFrom, endTo, isActive, pageable),
            workingPeriodMapper::toResponseDTO
        );
    }

    public WorkingPeriodResponseDTO findById(Long id) {
        WorkingPeriod existingWP = workingPeriodManagerService.findById(id);
        workingPeriodCheckerService.checkWorkingPeriodIsActive(existingWP);
        return workingPeriodMapper.toResponseDTO(existingWP);
    }

    @Transactional
    public WorkingPeriodResponseDTO create(WorkingPeriodCreateRequestDTO requestDTO) {
        workingPeriodCheckerService.checkCreateRequest(requestDTO);
        Department org = departmentManagerService.getReferenceById(requestDTO.getDepartId());
        WorkingPeriod newWP = workingPeriodMapper.toEntity(requestDTO, org);
        return workingPeriodMapper.toResponseDTO(workingPeriodManagerService.save(newWP));
    }

    @Transactional
    public WorkingPeriodResponseDTO update(Long id, WorkingPeriodUpdateRequestDTO requestDTO) {
        WorkingPeriod existingWP = workingPeriodManagerService.findById(id);
        workingPeriodCheckerService.checkWorkingPeriodIsActive(existingWP);
        workingPeriodCheckerService.checkUpdateRequest(id, requestDTO, existingWP);
        workingPeriodMapper.updateEntity(requestDTO, existingWP);
        return workingPeriodMapper.toResponseDTO(workingPeriodManagerService.save(existingWP));
    }

    @Transactional
    public void delete(Long id) {
        WorkingPeriod existingWP = workingPeriodManagerService.findById(id);
        workingPeriodCheckerService.checkWorkingPeriodIsActive(existingWP);
        existingWP.setIsActive(false);
        workingPeriodManagerService.save(existingWP);
    }
}