package project.office_workforce_service.service.common;

import jakarta.annotation.Nullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.office_workforce_service.mapper.CompanyMapper;
import project.office_workforce_service.model.dto.request.CompanyCreateRequestDTO;
import project.office_workforce_service.model.dto.request.CompanyUpdateRequestDTO;
import project.office_workforce_service.model.dto.response.CompanyResponseDTO;
import project.office_workforce_service.model.entity.Company;
import project.office_workforce_service.model.entity.CompanyDetail;
import project.office_workforce_service.service.manager.CompanyDetailManagerService;
import project.office_workforce_service.service.manager.CompanyManagerService;
import project.shared_office_starter.mapper.PaginationMapper;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

@Service
public class CompanyService {

    @Autowired
    private CompanyManagerService companyManagerService;

    @Autowired
    private CompanyDetailManagerService companyDetailManagerService;

    @Autowired
    private CompanyMapper companyMapper;

    @Autowired
    private PaginationMapper paginationMapper;

    public PaginationBaseResponseDTO<CompanyResponseDTO> search(
        @Nullable String q,
        @Nullable Boolean isActive,
        Pageable pageable) {

        return paginationMapper.toDTO(
            companyManagerService.search(q, isActive, pageable),
            company -> companyMapper.toResponseDTO(company, null)
        );
    }

    public CompanyResponseDTO findById(Long id) {
        Company company = companyManagerService.findById(id);
        CompanyDetail detail = companyDetailManagerService.findByCompanyId(id);
        return companyMapper.toResponseDTO(company, detail);
    }

    @Transactional
    public CompanyResponseDTO create(CompanyCreateRequestDTO requestDTO) {
        Company newCompany = companyMapper.toEntity(requestDTO);
        Company savedCompany = companyManagerService.save(newCompany);

        CompanyDetail savedDetail = null;
        if (requestDTO.getDetails() != null) {
            CompanyDetail detail = companyMapper.toDetailEntity(requestDTO.getDetails(), savedCompany);
            savedDetail = companyDetailManagerService.save(detail);
        }

        return companyMapper.toResponseDTO(savedCompany, savedDetail);
    }

    @Transactional
    public CompanyResponseDTO update(Long id, CompanyUpdateRequestDTO requestDTO) {
        Company existingCompany = companyManagerService.findById(id);
        companyMapper.updateEntity(requestDTO, existingCompany);
        Company savedCompany = companyManagerService.save(existingCompany);

        CompanyDetail savedDetail = null;
        if (requestDTO.getDetails() != null) {
            try {
                savedDetail = companyDetailManagerService.findByCompanyId(id);
            } catch (Exception e) {
                savedDetail = CompanyDetail.builder().company(savedCompany).build();
            }
            if (requestDTO.getDetails().getBio() != null) savedDetail.setBio(requestDTO.getDetails().getBio());
            if (requestDTO.getDetails().getAddress() != null) savedDetail.setAddress(requestDTO.getDetails().getAddress());
            if (requestDTO.getDetails().getIndustry() != null) savedDetail.setIndustry(requestDTO.getDetails().getIndustry());
            if (requestDTO.getDetails().getWebsite() != null) savedDetail.setWebsite(requestDTO.getDetails().getWebsite());

            savedDetail = companyDetailManagerService.save(savedDetail);
        }

        return companyMapper.toResponseDTO(savedCompany, savedDetail);
    }
}