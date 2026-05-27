package project.office_workforce_service.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.office_workforce_service.model.entity.Staff;
import project.office_workforce_service.model.entity.enums.WorkType;
import project.office_workforce_service.repository.base.AbstractBaseRepository;

@Repository
public interface StaffRepository extends AbstractBaseRepository<Staff, Long> {

    @Query("SELECT s FROM Staff s " +
        "JOIN s.person p " +
        "JOIN s.company c " +
        "JOIN s.org o " +
        "WHERE (:q IS NULL OR " +
        "LOWER(p.nameEnglish) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
        "LOWER(p.nameChinese) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
        "LOWER(s.custId) LIKE LOWER(CONCAT('%', :q, '%'))) " +
        "AND (:companyId IS NULL OR c.id = :companyId) " +
        "AND (:orgId IS NULL OR o.id = :orgId) " +
        "AND (:workType IS NULL OR s.type = :workType) " +
        "AND (:isActive IS NULL OR s.isActive = :isActive)")
    Page<Staff> search(@Param("q") String q,
                            @Param("companyId") Long companyId,
                            @Param("orgId") Long orgId,
                            @Param("workType") WorkType workType,
                            @Param("isActive") Boolean isActive,
                            Pageable pageable);
}