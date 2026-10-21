package project.office_expenditure_service.service.common;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.office_expenditure_service.mapper.OutcomeSubcategoryMapper;
import project.office_expenditure_service.model.dto.request.OutcomeSubcategoryCreateRequestDTO;
import project.office_expenditure_service.model.dto.request.OutcomeSubcategoryUpdateRequestDTO;
import project.office_expenditure_service.model.dto.response.OutcomeSubcategoryResponseDTO;
import project.office_expenditure_service.model.entity.OutcomeCategory;
import project.office_expenditure_service.model.entity.OutcomeSubcategory;
import project.office_expenditure_service.service.checker.OutcomeCategoryCheckerService;
import project.office_expenditure_service.service.checker.OutcomeSubcategoryCheckerService;
import project.office_expenditure_service.service.manager.OutcomeCategoryManagerService;
import project.office_expenditure_service.service.manager.OutcomeSubcategoryManagerService;
import project.shared_office_starter.mapper.PaginationMapper;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

@Service
public class OutcomeSubcategoryService {

    private final OutcomeSubcategoryManagerService outcomeSubcategoryManagerService;
    private final OutcomeCategoryManagerService outcomeCategoryManagerService;
    private final OutcomeSubcategoryCheckerService outcomeSubcategoryCheckerService;
    private final OutcomeCategoryCheckerService outcomeCategoryCheckerService;
    private final OutcomeSubcategoryMapper outcomeSubcategoryMapper;
    private final PaginationMapper paginationMapper;

    @Autowired
    public OutcomeSubcategoryService(
        OutcomeSubcategoryManagerService outcomeSubcategoryManagerService,
        OutcomeCategoryManagerService outcomeCategoryManagerService,
        OutcomeSubcategoryCheckerService outcomeSubcategoryCheckerService,
        OutcomeCategoryCheckerService outcomeCategoryCheckerService,
        OutcomeSubcategoryMapper outcomeSubcategoryMapper,
        PaginationMapper paginationMapper
    ) {
        this.outcomeSubcategoryManagerService = outcomeSubcategoryManagerService;
        this.outcomeCategoryManagerService = outcomeCategoryManagerService;
        this.outcomeSubcategoryCheckerService = outcomeSubcategoryCheckerService;
        this.outcomeCategoryCheckerService = outcomeCategoryCheckerService;
        this.outcomeSubcategoryMapper = outcomeSubcategoryMapper;
        this.paginationMapper = paginationMapper;
    }

    public PaginationBaseResponseDTO<OutcomeSubcategoryResponseDTO> findAll(Long categoryId, Long companyId, Pageable pageable) {
        Page<OutcomeSubcategory> page;
        if (categoryId != null) {
            page = outcomeSubcategoryManagerService.findByCategoryId(categoryId, true, pageable);
        } else {
            page = outcomeSubcategoryManagerService.findByCompanyId(companyId, true, pageable);
        }
        return paginationMapper.toDTO(page, outcomeSubcategoryMapper::toResponseDTO);
    }

    public OutcomeSubcategoryResponseDTO findById(Long id) {
        OutcomeSubcategory subcategory = outcomeSubcategoryManagerService.findById(id);
        outcomeSubcategoryCheckerService.checkSubcategoryIsActive(subcategory);
        return outcomeSubcategoryMapper.toResponseDTO(subcategory);
    }

    @Transactional
    public OutcomeSubcategoryResponseDTO create(OutcomeSubcategoryCreateRequestDTO requestDTO) {
        outcomeSubcategoryCheckerService.checkCreateRequest(requestDTO);
        OutcomeCategory category = outcomeCategoryManagerService.findById(requestDTO.getCategoryId());
        outcomeCategoryCheckerService.checkCategoryIsActive(category);

        OutcomeSubcategory entity = outcomeSubcategoryMapper.toEntity(requestDTO, category);
        OutcomeSubcategory saved = outcomeSubcategoryManagerService.save(entity);
        return outcomeSubcategoryMapper.toResponseDTO(saved);
    }

    @Transactional
    public OutcomeSubcategoryResponseDTO update(Long id, OutcomeSubcategoryUpdateRequestDTO requestDTO) {
        OutcomeSubcategory existing = outcomeSubcategoryManagerService.findById(id);
        outcomeSubcategoryCheckerService.checkSubcategoryIsActive(existing);
        outcomeSubcategoryCheckerService.checkUpdateRequest(requestDTO);

        OutcomeCategory category = null;
        if (requestDTO.getCategoryId() != null) {
            category = outcomeCategoryManagerService.findById(requestDTO.getCategoryId());
            outcomeCategoryCheckerService.checkCategoryIsActive(category);
        }

        outcomeSubcategoryMapper.updateEntity(requestDTO, existing, category);
        OutcomeSubcategory saved = outcomeSubcategoryManagerService.save(existing);
        return outcomeSubcategoryMapper.toResponseDTO(saved);
    }

    @Transactional
    public void delete(Long id) {
        OutcomeSubcategory existing = outcomeSubcategoryManagerService.findById(id);
        existing.setIsActive(false);
        outcomeSubcategoryManagerService.save(existing);
    }
}
