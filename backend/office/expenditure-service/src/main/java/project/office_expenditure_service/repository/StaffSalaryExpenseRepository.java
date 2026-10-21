package project.office_expenditure_service.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.office_expenditure_service.model.entity.StaffSalaryExpense;
import project.office_expenditure_service.model.entity.enums.IntervalPeriod;
import project.office_expenditure_service.repository.base.AbstractBaseRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StaffSalaryExpenseRepository extends AbstractBaseRepository<StaffSalaryExpense, Long> {

    @Query("SELECT e FROM StaffSalaryExpense e WHERE e.uid = :uid")
    Optional<StaffSalaryExpense> findByUid(@Param("uid") UUID uid);

    @Query("SELECT e FROM StaffSalaryExpense e WHERE e.companyId = :companyId AND (:isActive IS NULL OR e.isActive = :isActive)")
    Page<StaffSalaryExpense> findByCompanyId(@Param("companyId") Long companyId,
                                            @Param("isActive") Boolean isActive,
                                            Pageable pageable);

    @Query("SELECT e FROM StaffSalaryExpense e WHERE e.staffSalary.id = :staffSalaryId AND (:isActive IS NULL OR e.isActive = :isActive)")
    List<StaffSalaryExpense> findByStaffSalaryId(@Param("staffSalaryId") Long staffSalaryId,
                                                 @Param("isActive") Boolean isActive);

    @Query("SELECT e FROM StaffSalaryExpense e WHERE " +
           "(:companyId IS NULL OR e.companyId = :companyId) AND " +
           "(:period IS NULL OR e.period = :period) AND " +
           "(:fromTime IS NULL OR e.invokedAt >= :fromTime) AND " +
           "(:toTime IS NULL OR e.invokedAt <= :toTime) AND " +
           "(:q IS NULL OR LOWER(e.name) LIKE LOWER(CONCAT('%', :q, '%'))) AND " +
           "(:isActive IS NULL OR e.isActive = :isActive)")
    Page<StaffSalaryExpense> search(@Param("companyId") Long companyId,
                                    @Param("period") IntervalPeriod period,
                                    @Param("fromTime") LocalDateTime fromTime,
                                    @Param("toTime") LocalDateTime toTime,
                                    @Param("q") String q,
                                    @Param("isActive") Boolean isActive,
                                    Pageable pageable);
}
