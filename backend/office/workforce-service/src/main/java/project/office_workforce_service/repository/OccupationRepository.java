package project.office_workforce_service.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.office_workforce_service.model.entity.Occupation;
import project.office_workforce_service.repository.base.AbstractBaseRepository;

@Repository
public interface OccupationRepository extends AbstractBaseRepository<Occupation, Long> {

    @Query("SELECT o FROM Occupation o WHERE " +
        "(:orgId IS NULL OR o.org.id = :orgId) AND " +
        "(:q IS NULL OR LOWER(o.name) LIKE LOWER(CONCAT('%', :q, '%'))) AND " +
        "(:isActive IS NULL OR o.isActive = :isActive)")
    Page<Occupation> search(@Param("orgId") Long orgId,
                            @Param("q") String q,
                            @Param("isActive") Boolean isActive,
                            Pageable pageable);
}