package project.office_workforce_service.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.office_workforce_service.model.entity.Department;
import project.office_workforce_service.repository.base.AbstractBaseRepository;

@Repository
public interface DepartmentRepository extends AbstractBaseRepository<Department, Long> {

    @Query("SELECT o FROM Department o WHERE " +
        "(:companyId IS NULL OR o.company.id = :companyId) " +
        "AND (:q IS NULL OR " +
        "LOWER(o.name) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
        "LOWER(o.bio) LIKE LOWER(CONCAT('%', :q, '%'))) " +
        "AND (:isActive IS NULL OR o.isActive = :isActive)")
    Page<Department> search(@Param("companyId") Long companyId,
                            @Param("q") String q,
                            @Param("isActive") Boolean isActive,
                            Pageable pageable);
    @Query("SELECT o FROM Department o WHERE o.isActive = :isActive")
    Page<Department> findAllByIsActive(@Param("isActive") Boolean isActive,
                                       Pageable pageable);
    @Query("SELECT o FROM Department o WHERE o.company.id = :companyId AND o.isActive = :isActive")
    Page<Department> findAllByCompanyIdAndIsActive(
        @Param("companyId") Long companyId,
        @Param("isActive") Boolean isActive,
        Pageable pageable
    );
}