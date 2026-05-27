package project.office_workforce_service.service.manager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import project.office_workforce_service.model.entity.CompanyDetail;
import project.office_workforce_service.repository.CompanyDetailRepository;
import project.office_workforce_service.service.base.AbstractBaseService;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

@Service
public class CompanyDetailManagerService extends AbstractBaseService<CompanyDetail, Long> {

    private final CompanyDetailRepository companyDetailRepository;

    @Autowired
    public CompanyDetailManagerService(CompanyDetailRepository companyDetailRepository) {
        super(companyDetailRepository, "CompanyDetail");
        this.companyDetailRepository = companyDetailRepository;
    }

    public CompanyDetail findByCompanyId(Long companyId) {
        return companyDetailRepository.findByCompanyId(companyId)
            .orElseThrow(() -> new ResourceNotFoundException("CompanyDetail not found for company id: " + companyId));
    }

    public Page<CompanyDetail> search(String q, Pageable pageable) {
        return companyDetailRepository.search(q, pageable);
    }
}