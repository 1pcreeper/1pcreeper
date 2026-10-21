package project.office_workforce_service.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.office_workforce_service.model.entity.Schedule;
import project.office_workforce_service.model.entity.enums.ScheduleStatus;
import project.office_workforce_service.repository.base.AbstractBaseRepository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ScheduleRepository extends AbstractBaseRepository<Schedule, Long> {

    @Query("SELECT s FROM Schedule s WHERE " +
        "(:placeId IS NULL OR s.place.id = :placeId) " +
        "AND (:staffId IS NULL OR s.staff.id = :staffId) " +
        "AND (CAST(:status AS string) IS NULL OR s.status = :status) " +
        "AND (cast(:startFrom as timestamp) IS NULL OR s.startAt >= :startFrom) " +
        "AND (cast(:endTo as timestamp) IS NULL OR s.endAt <= :endTo)")
    Page<Schedule> search(@Param("placeId") Long placeId,
                                   @Param("staffId") Long staffId,
                                   @Param("status") ScheduleStatus status,
                                   @Param("startFrom") LocalDateTime startFrom,
                                   @Param("endTo") LocalDateTime endTo,
                                   Pageable pageable);

    @Query("SELECT s FROM Schedule s WHERE s.staff.id = :staffId AND s.place.id = :placeId " +
        "AND s.status <> :excludedStatus AND s.startAt < :endAt AND s.endAt > :startAt " +
        "AND (:excludeId IS NULL OR s.id <> :excludeId)")
    List<Schedule> findConflicts(@Param("staffId") Long staffId,
                                 @Param("placeId") Long placeId,
                                 @Param("startAt") LocalDateTime startAt,
                                 @Param("endAt") LocalDateTime endAt,
                                 @Param("excludedStatus") ScheduleStatus excludedStatus,
                                 @Param("excludeId") Long excludeId);

    @Query("SELECT COUNT(s) FROM Schedule s WHERE s.place.id = :placeId " +
        "AND s.occupation.id = :occupationId AND s.workingPeriod.id = :workingPeriodId " +
        "AND s.status <> :excludedStatus AND s.startAt >= :dayStart AND s.startAt < :dayEnd")
    long countSlotOccupancy(@Param("placeId") Long placeId,
                            @Param("occupationId") Long occupationId,
                            @Param("workingPeriodId") Long workingPeriodId,
                            @Param("dayStart") LocalDateTime dayStart,
                            @Param("dayEnd") LocalDateTime dayEnd,
                            @Param("excludedStatus") ScheduleStatus excludedStatus);
}