package project.office_workforce_service.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.office_workforce_service.model.entity.PlaceWorkingPeriodRule;
import project.office_workforce_service.repository.base.AbstractBaseRepository;

import java.util.List;

@Repository
public interface PlaceWorkingPeriodRuleRepository extends AbstractBaseRepository<PlaceWorkingPeriodRule, Long> {

    @Query("SELECT pwp FROM PlaceWorkingPeriodRule pwp WHERE " +
        "(:occupationRuleId IS NULL OR pwp.occupationRule.id = :occupationRuleId) AND " +
        "(:workingPeriodId IS NULL OR pwp.workingPeriod.id = :workingPeriodId)")
    Page<PlaceWorkingPeriodRule> search(@Param("occupationRuleId") Long occupationRuleId,
                                        @Param("workingPeriodId") Long workingPeriodId,
                                        Pageable pageable);

    List<PlaceWorkingPeriodRule> findByOccupationRuleId(Long occupationRuleId);

    boolean existsByOccupationRuleIdAndWorkingPeriodId(Long occupationRuleId, Long workingPeriodId);
}
