package project.office_workforce_service.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.office_workforce_service.model.entity.PlaceWorkingPeriodRule;
import project.office_workforce_service.repository.base.AbstractBaseRepository;

@Repository
public interface PlaceWorkingPeriodRuleRepository extends AbstractBaseRepository<PlaceWorkingPeriodRule, Long> {

    @Query("SELECT pwp FROM PlaceWorkingPeriodRule pwp WHERE " +
        "(:placeId IS NULL OR pwp.place.id = :placeId) AND " +
        "(:workingPeriodId IS NULL OR pwp.workingPeriod.id = :workingPeriodId)")
    Page<PlaceWorkingPeriodRule> search(@Param("placeId") Long placeId,
                                           @Param("workingPeriodId") Long workingPeriodId,
                                           Pageable pageable);
}