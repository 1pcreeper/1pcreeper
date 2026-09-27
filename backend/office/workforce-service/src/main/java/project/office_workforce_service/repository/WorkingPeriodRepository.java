package project.office_workforce_service.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.office_workforce_service.model.entity.WorkingPeriod;
import project.office_workforce_service.repository.base.AbstractBaseRepository;

import java.time.LocalTime;
import java.util.Optional;

@Repository
public interface WorkingPeriodRepository extends AbstractBaseRepository<WorkingPeriod, Long> {

    @Query("SELECT wp FROM WorkingPeriod wp WHERE " +
        "(:departId IS NULL OR wp.department.id = :departId) AND " +
        "(:q IS NULL OR LOWER(wp.name) LIKE LOWER(CONCAT('%', CAST(:q AS text), '%'))) AND " +
        "(CAST(:startFrom as time) IS NULL OR wp.startAt >= :startFrom) AND " +
        "(CAST(:endTo as time) IS NULL OR wp.endAt <= :endTo) AND " +
        "(CAST(:isActive AS boolean) IS NULL OR wp.isActive = :isActive)")
    Page<WorkingPeriod> search(@Param("departId") Long departId,
                               @Param("q") String q,
                               @Param("startFrom") LocalTime startFrom,
                               @Param("endTo") LocalTime endTo,
                               @Param("isActive") Boolean isActive,
                               Pageable pageable);
    
    @Query("SELECT wp FROM WorkingPeriod wp WHERE " +
        "wp.startAt = :startAt AND wp.endAt = :endAt AND " +
        "wp.department.id = :departId")
    Optional<WorkingPeriod> findByRangeAndDepartId(
        @Param("departId") Long departId,
        @Param("startAt") LocalTime startAt,
        @Param("endAt") LocalTime endAt
    );
    
}