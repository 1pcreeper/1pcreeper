package project.office_workforce_service.service.manager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import project.office_workforce_service.model.entity.Company;
import project.office_workforce_service.repository.CompanyRepository;
import project.office_workforce_service.service.base.AbstractBaseService;

@Service
public class CompanyManagerService extends AbstractBaseService<Company, Long> {

    private final CompanyRepository companyRepository;

    @Autowired
    public CompanyManagerService(CompanyRepository companyRepository) {
        super(companyRepository, "Company");
        this.companyRepository = companyRepository;
    }

    public Page<Company> search(String q, Boolean isActive, Pageable pageable) {
        return companyRepository.search(q, isActive, pageable);
    }
}