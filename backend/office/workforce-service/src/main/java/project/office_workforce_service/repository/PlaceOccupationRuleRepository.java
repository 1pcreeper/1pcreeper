package project.office_workforce_service.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.office_workforce_service.model.entity.PlaceOccupationRule;
import project.office_workforce_service.repository.base.AbstractBaseRepository;

@Repository
public interface PlaceOccupationRuleRepository extends AbstractBaseRepository<PlaceOccupationRule, Long> {

    @Query("SELECT po FROM PlaceOccupationRule po WHERE " +
        "(:placeId IS NULL OR po.place.id = :placeId) AND " +
        "(:occupationId IS NULL OR po.occupation.id = :occupationId)")
    Page<PlaceOccupationRule> search(@Param("placeId") Long placeId,
                                        @Param("occupationId") Long occupationId,
                                        Pageable pageable);
}