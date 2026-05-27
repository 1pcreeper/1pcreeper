package project.office_workforce_service.service.common;

import jakarta.annotation.Nullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.office_workforce_service.mapper.OrganizationMapper;
import project.office_workforce_service.model.dto.request.OrganizationCreateRequestDTO;
import project.office_workforce_service.model.dto.request.OrganizationUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.OrganizationResponseDTO;
import project.office_workforce_service.model.entity.Company;
import project.office_workforce_service.model.entity.Organization;
import project.office_workforce_service.service.manager.CompanyManagerService;
import project.office_workforce_service.service.manager.OrganizationManagerService;
import project.shared_office_starter.mapper.PaginationMapper;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

@Service
public class OrganizationService {

    @Autowired
    private OrganizationManagerService organizationManagerService;

    @Autowired
    private CompanyManagerService companyManagerService;

    @Autowired
    private OrganizationMapper organizationMapper;

    @Autowired
    private PaginationMapper paginationMapper;

    public PaginationBaseResponseDTO<OrganizationResponseDTO> search(
        @Nullable Long companyId,
        @Nullable String q,
        @Nullable Boolean isActive,
        Pageable pageable) {

        return paginationMapper.toDTO(
            organizationManagerService.search(companyId, q, isActive, pageable),
            organizationMapper::toResponseDTO
        );
    }

    public OrganizationResponseDTO findById(Long id) {
        return organizationMapper.toResponseDTO(organizationManagerService.findById(id));
    }

    @Transactional
    public OrganizationResponseDTO create(OrganizationCreateRequestDTO requestDTO) {
        Company company = companyManagerService.getReferenceById(requestDTO.getCompanyId());

        Organization newOrg = organizationMapper.toEntity(requestDTO, company);
        return organizationMapper.toResponseDTO(organizationManagerService.save(newOrg));
    }

    @Transactional
    public OrganizationResponseDTO update(Long id, OrganizationUpdateRequestDTO requestDTO) {
        Organization existingOrg = organizationManagerService.findById(id);

        organizationMapper.updateEntity(requestDTO, existingOrg);

        return organizationMapper.toResponseDTO(organizationManagerService.save(existingOrg));
    }
}