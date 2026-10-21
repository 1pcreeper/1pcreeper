package project.office_expenditure_service.service.common;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.office_expenditure_service.mapper.StaffSalaryMapper;
import project.office_expenditure_service.model.dto.request.StaffSalaryCreateRequestDTO;
import project.office_expenditure_service.model.dto.request.StaffSalaryUpdateRequestDTO;
import project.office_expenditure_service.model.dto.response.StaffSalaryResponseDTO;
import project.office_expenditure_service.model.entity.StaffSalary;
import project.office_expenditure_service.service.checker.StaffSalaryCheckerService;
import project.office_expenditure_service.service.manager.StaffSalaryManagerService;
import project.shared_office_starter.mapper.PaginationMapper;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

@Service
public class StaffSalaryService {

    private final StaffSalaryManagerService staffSalaryManagerService;
    private final StaffSalaryCheckerService staffSalaryCheckerService;
    private final StaffSalaryMapper staffSalaryMapper;
    private final PaginationMapper paginationMapper;

    @Autowired
    public StaffSalaryService(
        StaffSalaryManagerService staffSalaryManagerService,
        StaffSalaryCheckerService staffSalaryCheckerService,
        StaffSalaryMapper staffSalaryMapper,
        PaginationMapper paginationMapper
    ) {
        this.staffSalaryManagerService = staffSalaryManagerService;
        this.staffSalaryCheckerService = staffSalaryCheckerService;
        this.staffSalaryMapper = staffSalaryMapper;
        this.paginationMapper = paginationMapper;
    }

    public PaginationBaseResponseDTO<StaffSalaryResponseDTO> findAll(Long staffId, Pageable pageable) {
        Page<StaffSalary> page = staffSalaryManagerService.findByStaffIdPaged(staffId, true, pageable);
        return paginationMapper.toDTO(page, staffSalaryMapper::toResponseDTO);
    }

    public StaffSalaryResponseDTO findById(Long id) {
        StaffSalary salary = staffSalaryManagerService.findById(id);
        staffSalaryCheckerService.checkSalaryIsActive(salary);
        return staffSalaryMapper.toResponseDTO(salary);
    }

    @Transactional
    public StaffSalaryResponseDTO create(StaffSalaryCreateRequestDTO requestDTO) {
        staffSalaryCheckerService.checkCreateRequest(requestDTO);

        StaffSalary entity = staffSalaryMapper.toEntity(requestDTO);
        StaffSalary saved = staffSalaryManagerService.save(entity);
        return staffSalaryMapper.toResponseDTO(saved);
    }

    @Transactional
    public StaffSalaryResponseDTO update(Long id, StaffSalaryUpdateRequestDTO requestDTO) {
        StaffSalary existing = staffSalaryManagerService.findById(id);
        staffSalaryCheckerService.checkSalaryIsActive(existing);
        staffSalaryCheckerService.checkUpdateRequest(requestDTO);

        staffSalaryMapper.updateEntity(requestDTO, existing);
        StaffSalary saved = staffSalaryManagerService.save(existing);
        return staffSalaryMapper.toResponseDTO(saved);
    }

    @Transactional
    public void delete(Long id) {
        StaffSalary existing = staffSalaryManagerService.findById(id);
        existing.setIsActive(false);
        staffSalaryManagerService.save(existing);
    }
}
