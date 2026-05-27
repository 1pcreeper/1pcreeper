package project.office_workforce_service.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.office_workforce_service.model.entity.StaffOccupation;
import project.office_workforce_service.repository.base.AbstractBaseRepository;

@Repository
public interface StaffOccupationRepository extends AbstractBaseRepository<StaffOccupation, Long> {

    @Query("SELECT so FROM StaffOccupation so WHERE " +
        "(:staffId IS NULL OR so.staff.id = :staffId) AND " +
        "(:occupationId IS NULL OR so.occupation.id = :occupationId) AND " +
        "(:q IS NULL OR LOWER(so.remark) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<StaffOccupation> search(@Param("staffId") Long staffId,
                                 @Param("occupationId") Long occupationId,
                                 @Param("q") String q,
                                 Pageable pageable);
}