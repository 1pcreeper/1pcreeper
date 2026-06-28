package project.office_workforce_service.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.office_workforce_service.model.entity.Organization;
import project.office_workforce_service.model.entity.Staff;
import project.office_workforce_service.repository.base.AbstractBaseRepository;

@Repository
public interface OrganizationRepository extends AbstractBaseRepository<Organization, Long> {

    @Query("SELECT o FROM Organization o WHERE " +
        "(:companyId IS NULL OR o.company.id = :companyId) " +
        "AND (:q IS NULL OR " +
        "LOWER(o.name) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
        "LOWER(o.bio) LIKE LOWER(CONCAT('%', :q, '%'))) " +
        "AND (:isActive IS NULL OR o.isActive = :isActive)")
    Page<Organization> search(@Param("companyId") Long companyId,
                              @Param("q") String q,
                              @Param("isActive") Boolean isActive,
                              Pageable pageable);
    @Query("SELECT o FROM Organization o WHERE o.isActive = :isActive")
    Page<Organization> findAllByIsActive(@Param("isActive") Boolean isActive,
                              Pageable pageable);
    @Query("SELECT o FROM Organization o WHERE o.company.id = :companyId AND o.isActive = :isActive")
    Page<Organization> findAllByCompanyIdAndIsActive(
        @Param("companyId") Long companyId,
        @Param("isActive") Boolean isActive,
        Pageable pageable
    );
}