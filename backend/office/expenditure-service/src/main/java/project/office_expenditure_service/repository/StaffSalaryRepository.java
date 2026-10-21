package project.office_expenditure_service.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.office_expenditure_service.model.entity.StaffSalary;
import project.office_expenditure_service.repository.base.AbstractBaseRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StaffSalaryRepository extends AbstractBaseRepository<StaffSalary, Long> {

    @Query("SELECT s FROM StaffSalary s WHERE s.uid = :uid")
    Optional<StaffSalary> findByUid(@Param("uid") UUID uid);

    @Query("SELECT s FROM StaffSalary s WHERE s.staffId = :staffId AND (:isActive IS NULL OR s.isActive = :isActive) ORDER BY s.approvedAt DESC")
    List<StaffSalary> findByStaffId(@Param("staffId") Long staffId,
                                    @Param("isActive") Boolean isActive);

    @Query("SELECT s FROM StaffSalary s WHERE s.staffId = :staffId AND (:isActive IS NULL OR s.isActive = :isActive)")
    Page<StaffSalary> findByStaffIdPaged(@Param("staffId") Long staffId,
                                         @Param("isActive") Boolean isActive,
                                         Pageable pageable);

    @Query("SELECT s FROM StaffSalary s WHERE s.staffId = :staffId AND s.isActive = true ORDER BY s.approvedAt DESC LIMIT 1")
    Optional<StaffSalary> findLatestApprovedSalary(@Param("staffId") Long staffId);
}
