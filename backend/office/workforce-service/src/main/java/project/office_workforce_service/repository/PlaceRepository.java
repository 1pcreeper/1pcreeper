package project.office_workforce_service.repository;

import jakarta.annotation.Nullable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.office_workforce_service.model.entity.Place;
import project.office_workforce_service.repository.base.AbstractBaseRepository;

@Repository
public interface PlaceRepository extends AbstractBaseRepository<Place, Long> {

    @Query("SELECT p FROM Place p WHERE " +
        "(:companyId IS NULL OR p.department.company.id = :companyId) AND " +
        "(:departId IS NULL OR p.department.id = :departId) AND " +
        "(:q IS NULL OR " +
        "LOWER(p.name) LIKE LOWER(CONCAT('%', CAST(:q AS String), '%')) OR " +
        "LOWER(p.address) LIKE LOWER(CONCAT('%', CAST(:q AS String), '%'))) " +
        "AND (:isActive IS NULL OR p.isActive = :isActive)")
    Page<Place> search(@Param("companyId") Long companyId,
                       @Param("departId") Long departId,
                       @Param("q") @Nullable String q,
                       @Param("isActive") Boolean isActive,
                       Pageable pageable);

    boolean existsByDepartmentIdAndNameIgnoreCase(Long departmentId, String name);
    java.util.Optional<Place> findByDepartmentIdAndNameIgnoreCase(Long departmentId, String name);
}