package project.office_workforce_service.service.common;

import jakarta.annotation.Nullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.office_workforce_service.mapper.OrganizationMapper;
import project.office_workforce_service.model.dto.request.OrganizationCreateRequestDTO;
import project.office_workforce_service.model.dto.request.OrganizationUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.OrganizationResponseDTO;
import project.office_workforce_service.model.entity.Organization;
import project.office_workforce_service.model.entity.OrganizationDetail;
import project.office_workforce_service.service.checker.OrganizationCheckerService;
import project.office_workforce_service.service.manager.OrganizationDetailManagerService;
import project.office_workforce_service.service.manager.OrganizationManagerService;
import project.shared_office_starter.mapper.PaginationMapper;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

import java.util.UUID;

@Service
public class OrganizationService {

    private final OrganizationManagerService organizationManagerService;
    private final OrganizationDetailManagerService organizationDetailManagerService;
    private final OrganizationCheckerService organizationCheckerService;
    private final OrganizationMapper organizationMapper;
    private final PaginationMapper paginationMapper;

    @Autowired
    public OrganizationService(
        OrganizationManagerService organizationManagerService,
        OrganizationDetailManagerService organizationDetailManagerService,
        OrganizationCheckerService organizationCheckerService,
        OrganizationMapper organizationMapper,
        PaginationMapper paginationMapper
    ) {
        this.organizationManagerService = organizationManagerService;
        this.organizationDetailManagerService = organizationDetailManagerService;
        this.organizationCheckerService = organizationCheckerService;
        this.organizationMapper = organizationMapper;
        this.paginationMapper = paginationMapper;
    }

    public PaginationBaseResponseDTO<OrganizationResponseDTO> search(
        @Nullable String q,
        @Nullable Boolean isActive,
        Pageable pageable
    ) {
        Page<Organization> orgPage = organizationManagerService.search(q, isActive, pageable);
        return paginationMapper.toDTO(orgPage, organizationMapper::toResponseDTO);
    }

    public OrganizationResponseDTO findById(Long id) {
        Organization organization = organizationManagerService.findById(id);
        organizationCheckerService.checkOrganizationIsActive(organization);
        return organizationMapper.toResponseDTO(organization);
    }

    public OrganizationResponseDTO findByUid(UUID uid) {
        Organization organization = organizationManagerService.findByUid(uid);
        organizationCheckerService.checkOrganizationIsActive(organization);
        return organizationMapper.toResponseDTO(organization);
    }

    public PaginationBaseResponseDTO<OrganizationResponseDTO> findAll(Pageable pageable) {
        Page<Organization> orgPage = organizationManagerService.findAllByIsActive(true, pageable);
        return paginationMapper.toDTO(orgPage, organizationMapper::toResponseDTO);
    }

    @Transactional
    public OrganizationResponseDTO create(OrganizationCreateRequestDTO requestDTO) {
        // 1. Business & uniqueness validation
        organizationCheckerService.checkCreateRequest(requestDTO);

        // 2. Map to entity
        Organization newOrganization = organizationMapper.toEntity(requestDTO);

        // 3. Persist entity
        Organization savedOrganization = organizationManagerService.save(newOrganization);

        // 4. Initialize organization detail (empty row when no details provided)
        OrganizationDetail detail = requestDTO.getDetails() != null
            ? organizationMapper.toDetailEntity(requestDTO.getDetails(), savedOrganization)
            : OrganizationDetail.builder().organization(savedOrganization).build();
        organizationDetailManagerService.save(detail);

        // 5. Return response DTO
        return organizationMapper.toResponseDTO(savedOrganization);
    }

    @Transactional
    public OrganizationResponseDTO update(Long id, OrganizationUpdateRequestDTO requestDTO) {
        // 1. Retrieve entity
        Organization existingOrganization = organizationManagerService.findById(id);

        // 2. State & conflict validation
        organizationCheckerService.checkOrganizationIsActive(existingOrganization);
        organizationCheckerService.checkUpdateRequest(id, requestDTO);

        // 3. Update entity fields
        organizationMapper.updateEntity(requestDTO, existingOrganization);

        // 4. Persist updated entity
        Organization savedOrganization = organizationManagerService.save(existingOrganization);

        return organizationMapper.toResponseDTO(savedOrganization);
    }

    @Transactional
    public void delete(Long id) {
        Organization existingOrganization = organizationManagerService.findById(id);
        existingOrganization.setIsActive(false);
        organizationManagerService.save(existingOrganization);
    }
}
