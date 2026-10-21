package project.office_expenditure_service.service.common;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.office_expenditure_service.mapper.OutcomeExpenseMapper;
import project.office_expenditure_service.model.dto.request.OutcomeExpenseCreateRequestDTO;
import project.office_expenditure_service.model.dto.request.OutcomeExpenseUpdateRequestDTO;
import project.office_expenditure_service.model.dto.response.OutcomeExpenseResponseDTO;
import project.office_expenditure_service.model.entity.Outcome;
import project.office_expenditure_service.model.entity.OutcomeExpense;
import project.office_expenditure_service.service.checker.OutcomeCheckerService;
import project.office_expenditure_service.service.checker.OutcomeExpenseCheckerService;
import project.office_expenditure_service.service.manager.OutcomeExpenseManagerService;
import project.office_expenditure_service.service.manager.OutcomeManagerService;
import project.shared_office_starter.mapper.PaginationMapper;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

@Service
public class OutcomeExpenseService {

    private final OutcomeExpenseManagerService outcomeExpenseManagerService;
    private final OutcomeManagerService outcomeManagerService;
    private final OutcomeExpenseCheckerService outcomeExpenseCheckerService;
    private final OutcomeCheckerService outcomeCheckerService;
    private final OutcomeExpenseMapper outcomeExpenseMapper;
    private final PaginationMapper paginationMapper;

    @Autowired
    public OutcomeExpenseService(
        OutcomeExpenseManagerService outcomeExpenseManagerService,
        OutcomeManagerService outcomeManagerService,
        OutcomeExpenseCheckerService outcomeExpenseCheckerService,
        OutcomeCheckerService outcomeCheckerService,
        OutcomeExpenseMapper outcomeExpenseMapper,
        PaginationMapper paginationMapper
    ) {
        this.outcomeExpenseManagerService = outcomeExpenseManagerService;
        this.outcomeManagerService = outcomeManagerService;
        this.outcomeExpenseCheckerService = outcomeExpenseCheckerService;
        this.outcomeCheckerService = outcomeCheckerService;
        this.outcomeExpenseMapper = outcomeExpenseMapper;
        this.paginationMapper = paginationMapper;
    }

    public PaginationBaseResponseDTO<OutcomeExpenseResponseDTO> findAll(Long companyId, Long outcomeId, Pageable pageable) {
        Page<OutcomeExpense> page = outcomeExpenseManagerService.findByCompanyId(companyId, true, pageable);
        return paginationMapper.toDTO(page, outcomeExpenseMapper::toResponseDTO);
    }

    public OutcomeExpenseResponseDTO findById(Long id) {
        OutcomeExpense expense = outcomeExpenseManagerService.findById(id);
        outcomeExpenseCheckerService.checkExpenseIsActive(expense);
        return outcomeExpenseMapper.toResponseDTO(expense);
    }

    @Transactional
    public OutcomeExpenseResponseDTO create(OutcomeExpenseCreateRequestDTO requestDTO) {
        outcomeExpenseCheckerService.checkCreateRequest(requestDTO);

        Outcome outcome = null;
        if (requestDTO.getOutcomeId() != null) {
            outcome = outcomeManagerService.findById(requestDTO.getOutcomeId());
            outcomeCheckerService.checkOutcomeIsActive(outcome);
        }

        OutcomeExpense entity = outcomeExpenseMapper.toEntity(requestDTO, outcome);
        OutcomeExpense saved = outcomeExpenseManagerService.save(entity);
        return outcomeExpenseMapper.toResponseDTO(saved);
    }

    @Transactional
    public OutcomeExpenseResponseDTO update(Long id, OutcomeExpenseUpdateRequestDTO requestDTO) {
        OutcomeExpense existing = outcomeExpenseManagerService.findById(id);
        outcomeExpenseCheckerService.checkExpenseIsActive(existing);
        outcomeExpenseCheckerService.checkUpdateRequest(requestDTO);

        Outcome outcome = null;
        if (requestDTO.getOutcomeId() != null) {
            outcome = outcomeManagerService.findById(requestDTO.getOutcomeId());
            outcomeCheckerService.checkOutcomeIsActive(outcome);
        }

        outcomeExpenseMapper.updateEntity(requestDTO, existing, outcome);
        OutcomeExpense saved = outcomeExpenseManagerService.save(existing);
        return outcomeExpenseMapper.toResponseDTO(saved);
    }

    @Transactional
    public void delete(Long id) {
        OutcomeExpense existing = outcomeExpenseManagerService.findById(id);
        existing.setIsActive(false);
        outcomeExpenseManagerService.save(existing);
    }
}
