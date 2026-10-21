package project.office_expenditure_service.service.common;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.office_expenditure_service.mapper.OutcomeCategoryMapper;
import project.office_expenditure_service.model.dto.request.OutcomeCategoryCreateRequestDTO;
import project.office_expenditure_service.model.dto.request.OutcomeCategoryUpdateRequestDTO;
import project.office_expenditure_service.model.dto.response.OutcomeCategoryResponseDTO;
import project.office_expenditure_service.model.entity.OutcomeCategory;
import project.office_expenditure_service.service.checker.OutcomeCategoryCheckerService;
import project.office_expenditure_service.service.manager.OutcomeCategoryManagerService;
import project.shared_office_starter.mapper.PaginationMapper;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

@Service
public class OutcomeCategoryService {

    private final OutcomeCategoryManagerService outcomeCategoryManagerService;
    private final OutcomeCategoryCheckerService outcomeCategoryCheckerService;
    private final OutcomeCategoryMapper outcomeCategoryMapper;
    private final PaginationMapper paginationMapper;

    @Autowired
    public OutcomeCategoryService(
        OutcomeCategoryManagerService outcomeCategoryManagerService,
        OutcomeCategoryCheckerService outcomeCategoryCheckerService,
        OutcomeCategoryMapper outcomeCategoryMapper,
        PaginationMapper paginationMapper
    ) {
        this.outcomeCategoryManagerService = outcomeCategoryManagerService;
        this.outcomeCategoryCheckerService = outcomeCategoryCheckerService;
        this.outcomeCategoryMapper = outcomeCategoryMapper;
        this.paginationMapper = paginationMapper;
    }

    public PaginationBaseResponseDTO<OutcomeCategoryResponseDTO> findAll(Long companyId, Pageable pageable) {
        Page<OutcomeCategory> page = outcomeCategoryManagerService.findByCompanyId(companyId, true, pageable);
        return paginationMapper.toDTO(page, outcomeCategoryMapper::toResponseDTO);
    }

    public OutcomeCategoryResponseDTO findById(Long id) {
        OutcomeCategory category = outcomeCategoryManagerService.findById(id);
        outcomeCategoryCheckerService.checkCategoryIsActive(category);
        return outcomeCategoryMapper.toResponseDTO(category);
    }

    @Transactional
    public OutcomeCategoryResponseDTO create(OutcomeCategoryCreateRequestDTO requestDTO) {
        outcomeCategoryCheckerService.checkCreateRequest(requestDTO);

        OutcomeCategory entity = outcomeCategoryMapper.toEntity(requestDTO);
        OutcomeCategory saved = outcomeCategoryManagerService.save(entity);
        return outcomeCategoryMapper.toResponseDTO(saved);
    }

    @Transactional
    public OutcomeCategoryResponseDTO update(Long id, OutcomeCategoryUpdateRequestDTO requestDTO) {
        OutcomeCategory existing = outcomeCategoryManagerService.findById(id);
        outcomeCategoryCheckerService.checkCategoryIsActive(existing);
        outcomeCategoryCheckerService.checkUpdateRequest(requestDTO);

        outcomeCategoryMapper.updateEntity(requestDTO, existing);
        OutcomeCategory saved = outcomeCategoryManagerService.save(existing);
        return outcomeCategoryMapper.toResponseDTO(saved);
    }

    @Transactional
    public void delete(Long id) {
        OutcomeCategory existing = outcomeCategoryManagerService.findById(id);
        existing.setIsActive(false);
        outcomeCategoryManagerService.save(existing);
    }
}
