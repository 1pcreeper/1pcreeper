package project.office_workforce_service.repository;

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
        "(:orgId IS NULL OR p.org.id = :orgId) AND " +
        "(:q IS NULL OR " +
        "LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
        "LOWER(p.address) LIKE LOWER(CONCAT('%', :q, '%'))) " +
        "AND (:isActive IS NULL OR p.isActive = :isActive)")
    Page<Place> search(@Param("orgId") Long orgId,
                       @Param("q") String q,
                       @Param("isActive") Boolean isActive,
                       Pageable pageable);
}