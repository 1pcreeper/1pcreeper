package project.office_expenditure_service.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.office_expenditure_service.model.entity.OutcomeSubcategory;
import project.office_expenditure_service.repository.base.AbstractBaseRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OutcomeSubcategoryRepository extends AbstractBaseRepository<OutcomeSubcategory, Long> {

    @Query("SELECT s FROM OutcomeSubcategory s WHERE s.uid = :uid")
    Optional<OutcomeSubcategory> findByUid(@Param("uid") UUID uid);

    @Query("SELECT s FROM OutcomeSubcategory s WHERE s.category.id = :categoryId AND (:isActive IS NULL OR s.isActive = :isActive)")
    Page<OutcomeSubcategory> findByCategoryId(@Param("categoryId") Long categoryId,
                                              @Param("isActive") Boolean isActive,
                                              Pageable pageable);

    @Query("SELECT s FROM OutcomeSubcategory s WHERE s.category.id = :categoryId AND (:isActive IS NULL OR s.isActive = :isActive) ORDER BY s.name ASC")
    List<OutcomeSubcategory> findAllByCategoryId(@Param("categoryId") Long categoryId,
                                                 @Param("isActive") Boolean isActive);

    @Query("SELECT s FROM OutcomeSubcategory s WHERE s.companyId = :companyId AND (:isActive IS NULL OR s.isActive = :isActive)")
    Page<OutcomeSubcategory> findByCompanyId(@Param("companyId") Long companyId,
                                            @Param("isActive") Boolean isActive,
                                            Pageable pageable);

    @Query("SELECT s FROM OutcomeSubcategory s WHERE " +
           "(:companyId IS NULL OR s.companyId = :companyId) AND " +
           "(:categoryId IS NULL OR s.category.id = :categoryId) AND " +
           "(:q IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :q, '%'))) AND " +
           "(:isActive IS NULL OR s.isActive = :isActive)")
    Page<OutcomeSubcategory> search(@Param("companyId") Long companyId,
                                    @Param("categoryId") Long categoryId,
                                    @Param("q") String q,
                                    @Param("isActive") Boolean isActive,
                                    Pageable pageable);
}
