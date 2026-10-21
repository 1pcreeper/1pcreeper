package project.office_workforce_service.service.common;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.office_workforce_service.mapper.OrganizationMapper;
import project.office_workforce_service.model.dto.request.OrganizationDetailRequestDTO;
import project.office_workforce_service.model.dto.response.OrganizationDetailResponseDTO;
import project.office_workforce_service.model.entity.Organization;
import project.office_workforce_service.model.entity.OrganizationDetail;
import project.office_workforce_service.service.checker.OrganizationDetailCheckerService;
import project.office_workforce_service.service.manager.OrganizationDetailManagerService;
import project.office_workforce_service.service.manager.OrganizationManagerService;

@Service
public class OrganizationDetailService {

    @Autowired
    private OrganizationDetailManagerService organizationDetailManagerService;

    @Autowired
    private OrganizationManagerService organizationManagerService;

    @Autowired
    private OrganizationDetailCheckerService organizationDetailCheckerService;

    @Autowired
    private OrganizationMapper organizationMapper;

    public OrganizationDetailResponseDTO findByOrgId(Long orgId) {
        return organizationMapper.toDetailResponse(organizationDetailManagerService.findByOrgId(orgId));
    }

    @Transactional
    public OrganizationDetailResponseDTO upsert(Long orgId, OrganizationDetailRequestDTO requestDTO) {
        organizationDetailCheckerService.checkUpsertRequest(orgId, requestDTO);

        OrganizationDetail detail = organizationDetailManagerService.findOptionalByOrgId(orgId)
            .orElseGet(() -> {
                Organization organization = organizationManagerService.findById(orgId);
                return OrganizationDetail.builder().organization(organization).build();
            });

        if (requestDTO.getBio() != null) detail.setBio(requestDTO.getBio());
        if (requestDTO.getAddress() != null) detail.setAddress(requestDTO.getAddress());
        if (requestDTO.getIndustry() != null) detail.setIndustry(requestDTO.getIndustry());
        if (requestDTO.getWebsite() != null) detail.setWebsite(requestDTO.getWebsite());

        return organizationMapper.toDetailResponse(organizationDetailManagerService.save(detail));
    }
}
