package project.office_workforce_service.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.office_workforce_service.model.entity.StaffSchedulePreference;
import project.office_workforce_service.repository.base.AbstractBaseRepository;

@Repository
public interface StaffSchedulePreferenceRepository extends AbstractBaseRepository<StaffSchedulePreference, Long> {

    // Orders the results by priorityIndex automatically so the engine can process preferred shifts first
    @Query("SELECT ssp FROM StaffSchedulePreference ssp WHERE " +
        "(:staffId IS NULL OR ssp.staff.id = :staffId) AND " +
        "(:placeId IS NULL OR ssp.place.id = :placeId) AND " +
        "(:weekDay IS NULL OR ssp.weekDay = :weekDay) " +
        "ORDER BY ssp.priorityIndex DESC")
    Page<StaffSchedulePreference> search(@Param("staffId") Long staffId,
                                                    @Param("placeId") Long placeId,
                                                    @Param("weekDay") Integer weekDay,
                                                    Pageable pageable);
}