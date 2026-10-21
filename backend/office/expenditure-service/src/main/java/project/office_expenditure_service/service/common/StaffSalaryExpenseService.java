package project.office_expenditure_service.service.common;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.office_expenditure_service.mapper.StaffSalaryExpenseMapper;
import project.office_expenditure_service.model.dto.request.StaffSalaryExpenseCreateRequestDTO;
import project.office_expenditure_service.model.dto.request.StaffSalaryExpenseUpdateRequestDTO;
import project.office_expenditure_service.model.dto.response.StaffSalaryExpenseResponseDTO;
import project.office_expenditure_service.model.entity.StaffSalary;
import project.office_expenditure_service.model.entity.StaffSalaryExpense;
import project.office_expenditure_service.service.checker.StaffSalaryCheckerService;
import project.office_expenditure_service.service.checker.StaffSalaryExpenseCheckerService;
import project.office_expenditure_service.service.manager.StaffSalaryExpenseManagerService;
import project.office_expenditure_service.service.manager.StaffSalaryManagerService;
import project.shared_office_starter.mapper.PaginationMapper;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

@Service
public class StaffSalaryExpenseService {

    private final StaffSalaryExpenseManagerService staffSalaryExpenseManagerService;
    private final StaffSalaryManagerService staffSalaryManagerService;
    private final StaffSalaryExpenseCheckerService staffSalaryExpenseCheckerService;
    private final StaffSalaryCheckerService staffSalaryCheckerService;
    private final StaffSalaryExpenseMapper staffSalaryExpenseMapper;
    private final PaginationMapper paginationMapper;

    @Autowired
    public StaffSalaryExpenseService(
        StaffSalaryExpenseManagerService staffSalaryExpenseManagerService,
        StaffSalaryManagerService staffSalaryManagerService,
        StaffSalaryExpenseCheckerService staffSalaryExpenseCheckerService,
        StaffSalaryCheckerService staffSalaryCheckerService,
        StaffSalaryExpenseMapper staffSalaryExpenseMapper,
        PaginationMapper paginationMapper
    ) {
        this.staffSalaryExpenseManagerService = staffSalaryExpenseManagerService;
        this.staffSalaryManagerService = staffSalaryManagerService;
        this.staffSalaryExpenseCheckerService = staffSalaryExpenseCheckerService;
        this.staffSalaryCheckerService = staffSalaryCheckerService;
        this.staffSalaryExpenseMapper = staffSalaryExpenseMapper;
        this.paginationMapper = paginationMapper;
    }

    public PaginationBaseResponseDTO<StaffSalaryExpenseResponseDTO> findAll(Long companyId, Long staffSalaryId, Pageable pageable) {
        Page<StaffSalaryExpense> page;
        if (staffSalaryId != null) {
            page = staffSalaryExpenseManagerService.findByCompanyId(companyId, true, pageable);
        } else {
            page = staffSalaryExpenseManagerService.findByCompanyId(companyId, true, pageable);
        }
        return paginationMapper.toDTO(page, staffSalaryExpenseMapper::toResponseDTO);
    }

    public StaffSalaryExpenseResponseDTO findById(Long id) {
        StaffSalaryExpense expense = staffSalaryExpenseManagerService.findById(id);
        staffSalaryExpenseCheckerService.checkExpenseIsActive(expense);
        return staffSalaryExpenseMapper.toResponseDTO(expense);
    }

    @Transactional
    public StaffSalaryExpenseResponseDTO create(StaffSalaryExpenseCreateRequestDTO requestDTO) {
        staffSalaryExpenseCheckerService.checkCreateRequest(requestDTO);

        StaffSalary staffSalary = staffSalaryManagerService.findById(requestDTO.getStaffSalaryId());
        staffSalaryCheckerService.checkSalaryIsActive(staffSalary);

        StaffSalaryExpense entity = staffSalaryExpenseMapper.toEntity(requestDTO, staffSalary);
        StaffSalaryExpense saved = staffSalaryExpenseManagerService.save(entity);
        return staffSalaryExpenseMapper.toResponseDTO(saved);
    }

    @Transactional
    public StaffSalaryExpenseResponseDTO update(Long id, StaffSalaryExpenseUpdateRequestDTO requestDTO) {
        StaffSalaryExpense existing = staffSalaryExpenseManagerService.findById(id);
        staffSalaryExpenseCheckerService.checkExpenseIsActive(existing);
        staffSalaryExpenseCheckerService.checkUpdateRequest(requestDTO);

        StaffSalary staffSalary = null;
        if (requestDTO.getStaffSalaryId() != null) {
            staffSalary = staffSalaryManagerService.findById(requestDTO.getStaffSalaryId());
            staffSalaryCheckerService.checkSalaryIsActive(staffSalary);
        }

        staffSalaryExpenseMapper.updateEntity(requestDTO, existing, staffSalary);
        StaffSalaryExpense saved = staffSalaryExpenseManagerService.save(existing);
        return staffSalaryExpenseMapper.toResponseDTO(saved);
    }

    @Transactional
    public void delete(Long id) {
        StaffSalaryExpense existing = staffSalaryExpenseManagerService.findById(id);
        existing.setIsActive(false);
        staffSalaryExpenseManagerService.save(existing);
    }
}
