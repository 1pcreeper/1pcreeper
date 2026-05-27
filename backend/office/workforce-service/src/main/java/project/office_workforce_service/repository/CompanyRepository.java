package project.office_workforce_service.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.office_workforce_service.model.entity.Company;
import project.office_workforce_service.repository.base.AbstractBaseRepository;

@Repository
public interface CompanyRepository extends AbstractBaseRepository<Company, Long> {

    @Query("SELECT c FROM Company c WHERE " +
        "(:q IS NULL OR " +
        "LOWER(c.nameEnglish) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
        "LOWER(c.nameChinese) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
        "LOWER(c.email) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
        "LOWER(c.businessRegistrationNumber) LIKE LOWER(CONCAT('%', :q, '%'))) " +
        "AND (:isActive IS NULL OR c.isActive = :isActive)")
    Page<Company> search(@Param("q") String q,
                         @Param("isActive") Boolean isActive,
                         Pageable pageable);
}