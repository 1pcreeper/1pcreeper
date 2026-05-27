package project.office_workforce_service.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.office_workforce_service.model.entity.CompanyDetail;
import project.office_workforce_service.repository.base.AbstractBaseRepository;

import java.util.Optional;

@Repository
public interface CompanyDetailRepository extends AbstractBaseRepository<CompanyDetail, Long> {

    Optional<CompanyDetail> findByCompanyId(Long companyId);

    @Query("SELECT cd FROM CompanyDetail cd WHERE " +
        "(:q IS NULL OR " +
        "LOWER(cd.industry) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
        "LOWER(cd.address) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<CompanyDetail> search(@Param("q") String q, Pageable pageable);
}