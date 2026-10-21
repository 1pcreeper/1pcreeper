package project.office_expenditure_service.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.office_expenditure_service.model.entity.Outcome;
import project.office_expenditure_service.repository.base.AbstractBaseRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OutcomeRepository extends AbstractBaseRepository<Outcome, Long> {

    @Query("SELECT o FROM Outcome o WHERE o.uid = :uid")
    Optional<Outcome> findByUid(@Param("uid") UUID uid);

    @Query("SELECT o FROM Outcome o WHERE o.subcategory.id = :subcategoryId AND (:isActive IS NULL OR o.isActive = :isActive)")
    Page<Outcome> findBySubcategoryId(@Param("subcategoryId") Long subcategoryId,
                                      @Param("isActive") Boolean isActive,
                                      Pageable pageable);

    @Query("SELECT o FROM Outcome o WHERE o.subcategory.id = :subcategoryId AND (:isActive IS NULL OR o.isActive = :isActive) ORDER BY o.name ASC")
    List<Outcome> findAllBySubcategoryId(@Param("subcategoryId") Long subcategoryId,
                                         @Param("isActive") Boolean isActive);

    @Query("SELECT o FROM Outcome o WHERE o.companyId = :companyId AND (:isActive IS NULL OR o.isActive = :isActive)")
    Page<Outcome> findByCompanyId(@Param("companyId") Long companyId,
                                  @Param("isActive") Boolean isActive,
                                  Pageable pageable);

    @Query("SELECT o FROM Outcome o WHERE " +
           "(:companyId IS NULL OR o.companyId = :companyId) AND " +
           "(:subcategoryId IS NULL OR o.subcategory.id = :subcategoryId) AND " +
           "(:q IS NULL OR LOWER(o.name) LIKE LOWER(CONCAT('%', :q, '%'))) AND " +
           "(:isActive IS NULL OR o.isActive = :isActive)")
    Page<Outcome> search(@Param("companyId") Long companyId,
                         @Param("subcategoryId") Long subcategoryId,
                         @Param("q") String q,
                         @Param("isActive") Boolean isActive,
                         Pageable pageable);
}
