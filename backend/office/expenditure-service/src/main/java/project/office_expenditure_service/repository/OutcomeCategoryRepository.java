package project.office_expenditure_service.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.office_expenditure_service.model.entity.OutcomeCategory;
import project.office_expenditure_service.repository.base.AbstractBaseRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OutcomeCategoryRepository extends AbstractBaseRepository<OutcomeCategory, Long> {

    @Query("SELECT c FROM OutcomeCategory c WHERE c.uid = :uid")
    Optional<OutcomeCategory> findByUid(@Param("uid") UUID uid);

    @Query("SELECT c FROM OutcomeCategory c WHERE c.companyId = :companyId AND (:isActive IS NULL OR c.isActive = :isActive)")
    Page<OutcomeCategory> findByCompanyId(@Param("companyId") Long companyId,
                                          @Param("isActive") Boolean isActive,
                                          Pageable pageable);

    @Query("SELECT c FROM OutcomeCategory c WHERE c.companyId = :companyId AND (:isActive IS NULL OR c.isActive = :isActive) ORDER BY c.name ASC")
    List<OutcomeCategory> findAllByCompanyId(@Param("companyId") Long companyId,
                                             @Param("isActive") Boolean isActive);

    @Query("SELECT c FROM OutcomeCategory c WHERE " +
           "(:companyId IS NULL OR c.companyId = :companyId) AND " +
           "(:q IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :q, '%'))) AND " +
           "(:isActive IS NULL OR c.isActive = :isActive)")
    Page<OutcomeCategory> search(@Param("companyId") Long companyId,
                                 @Param("q") String q,
                                 @Param("isActive") Boolean isActive,
                                 Pageable pageable);
}
