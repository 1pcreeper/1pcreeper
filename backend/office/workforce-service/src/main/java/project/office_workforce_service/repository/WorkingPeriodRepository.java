package project.office_workforce_service.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.office_workforce_service.model.entity.WorkingPeriod;
import project.office_workforce_service.repository.base.AbstractBaseRepository;

import java.time.LocalTime;

@Repository
public interface WorkingPeriodRepository extends AbstractBaseRepository<WorkingPeriod, Long> {

    @Query("SELECT wp FROM WorkingPeriod wp WHERE " +
        "(:orgId IS NULL OR wp.org.id = :orgId) AND " +
        "(:q IS NULL OR LOWER(wp.name) LIKE LOWER(CONCAT('%', :q, '%'))) AND " +
        "(cast(:startFrom as time) IS NULL OR wp.startAt >= :startFrom) AND " +
        "(cast(:endTo as time) IS NULL OR wp.endAt <= :endTo) AND " +
        "(:isActive IS NULL OR wp.isActive = :isActive)")
    Page<WorkingPeriod> search(@Param("orgId") Long orgId,
                               @Param("q") String q,
                               @Param("startFrom") LocalTime startFrom,
                               @Param("endTo") LocalTime endTo,
                               @Param("isActive") Boolean isActive,
                               Pageable pageable);
}