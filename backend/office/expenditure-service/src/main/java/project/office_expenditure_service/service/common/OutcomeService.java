package project.office_expenditure_service.service.common;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.office_expenditure_service.mapper.OutcomeMapper;
import project.office_expenditure_service.model.dto.request.OutcomeCreateRequestDTO;
import project.office_expenditure_service.model.dto.request.OutcomeUpdateRequestDTO;
import project.office_expenditure_service.model.dto.response.OutcomeResponseDTO;
import project.office_expenditure_service.model.entity.Outcome;
import project.office_expenditure_service.model.entity.OutcomeSubcategory;
import project.office_expenditure_service.service.checker.OutcomeCheckerService;
import project.office_expenditure_service.service.checker.OutcomeSubcategoryCheckerService;
import project.office_expenditure_service.service.manager.OutcomeManagerService;
import project.office_expenditure_service.service.manager.OutcomeSubcategoryManagerService;
import project.shared_office_starter.mapper.PaginationMapper;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

@Service
public class OutcomeService {

    private final OutcomeManagerService outcomeManagerService;
    private final OutcomeSubcategoryManagerService outcomeSubcategoryManagerService;
    private final OutcomeCheckerService outcomeCheckerService;
    private final OutcomeSubcategoryCheckerService outcomeSubcategoryCheckerService;
    private final OutcomeMapper outcomeMapper;
    private final PaginationMapper paginationMapper;

    @Autowired
    public OutcomeService(
        OutcomeManagerService outcomeManagerService,
        OutcomeSubcategoryManagerService outcomeSubcategoryManagerService,
        OutcomeCheckerService outcomeCheckerService,
        OutcomeSubcategoryCheckerService outcomeSubcategoryCheckerService,
        OutcomeMapper outcomeMapper,
        PaginationMapper paginationMapper
    ) {
        this.outcomeManagerService = outcomeManagerService;
        this.outcomeSubcategoryManagerService = outcomeSubcategoryManagerService;
        this.outcomeCheckerService = outcomeCheckerService;
        this.outcomeSubcategoryCheckerService = outcomeSubcategoryCheckerService;
        this.outcomeMapper = outcomeMapper;
        this.paginationMapper = paginationMapper;
    }

    public PaginationBaseResponseDTO<OutcomeResponseDTO> findAll(Long subcategoryId, Long companyId, Pageable pageable) {
        Page<Outcome> page;
        if (subcategoryId != null) {
            page = outcomeManagerService.findBySubcategoryId(subcategoryId, true, pageable);
        } else {
            page = outcomeManagerService.findByCompanyId(companyId, true, pageable);
        }
        return paginationMapper.toDTO(page, outcomeMapper::toResponseDTO);
    }

    public OutcomeResponseDTO findById(Long id) {
        Outcome outcome = outcomeManagerService.findById(id);
        outcomeCheckerService.checkOutcomeIsActive(outcome);
        return outcomeMapper.toResponseDTO(outcome);
    }

    @Transactional
    public OutcomeResponseDTO create(OutcomeCreateRequestDTO requestDTO) {
        outcomeCheckerService.checkCreateRequest(requestDTO);
        OutcomeSubcategory subcategory = outcomeSubcategoryManagerService.findById(requestDTO.getSubcategoryId());
        outcomeSubcategoryCheckerService.checkSubcategoryIsActive(subcategory);

        Outcome entity = outcomeMapper.toEntity(requestDTO, subcategory);
        Outcome saved = outcomeManagerService.save(entity);
        return outcomeMapper.toResponseDTO(saved);
    }

    @Transactional
    public OutcomeResponseDTO update(Long id, OutcomeUpdateRequestDTO requestDTO) {
        Outcome existing = outcomeManagerService.findById(id);
        outcomeCheckerService.checkOutcomeIsActive(existing);
        outcomeCheckerService.checkUpdateRequest(requestDTO);

        OutcomeSubcategory subcategory = null;
        if (requestDTO.getSubcategoryId() != null) {
            subcategory = outcomeSubcategoryManagerService.findById(requestDTO.getSubcategoryId());
            outcomeSubcategoryCheckerService.checkSubcategoryIsActive(subcategory);
        }

        outcomeMapper.updateEntity(requestDTO, existing, subcategory);
        Outcome saved = outcomeManagerService.save(existing);
        return outcomeMapper.toResponseDTO(saved);
    }

    @Transactional
    public void delete(Long id) {
        Outcome existing = outcomeManagerService.findById(id);
        existing.setIsActive(false);
        outcomeManagerService.save(existing);
    }
}
