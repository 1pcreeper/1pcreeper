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

@Repository
public interface ScheduleRepository extends AbstractBaseRepository<Schedule, Long> {

    @Query("SELECT s FROM Schedule s WHERE " +
        "(:placeId IS NULL OR s.place.id = :placeId) " +
        "AND (:staffId IS NULL OR s.staff.id = :staffId) " +
        "AND (:status IS NULL OR s.status = :status) " +
        "AND (cast(:startFrom as timestamp) IS NULL OR s.startAt >= :startFrom) " +
        "AND (cast(:endTo as timestamp) IS NULL OR s.endAt <= :endTo)")
    Page<Schedule> search(@Param("placeId") Long placeId,
                                   @Param("staffId") Long staffId,
                                   @Param("status") ScheduleStatus status,
                                   @Param("startFrom") LocalDateTime startFrom,
                                   @Param("endTo") LocalDateTime endTo,
                                   Pageable pageable);
}