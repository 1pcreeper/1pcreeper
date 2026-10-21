package project.office_workforce_service.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.office_workforce_service.model.entity.Company;
import project.office_workforce_service.model.entity.Staff;
import project.office_workforce_service.model.entity.enums.WorkType;
import project.office_workforce_service.repository.base.AbstractBaseRepository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StaffRepository extends AbstractBaseRepository<Staff, Long> {

    @Query("SELECT s FROM Staff s " +
        "JOIN s.person p " +
        "JOIN s.company c " +
        "JOIN s.department d " +
        "WHERE (:q IS NULL OR " +
        "LOWER(p.nameEnglish) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
        "LOWER(p.nameChinese) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
        "LOWER(s.custId) LIKE LOWER(CONCAT('%', :q, '%'))) " +
        "AND (CAST(:companyId AS long) IS NULL OR c.id = :companyId) " +
        "AND (CAST(:departId AS long) IS NULL OR d.id = :departId) " +
        "AND (CAST(:workType AS string) IS NULL OR s.type = :workType) " +
        "AND (CAST(:isActive AS boolean) IS NULL OR (s.isActive = :isActive AND s.person.isActive = :isActive))")
    Page<Staff> search(@Param("q") String q,
                            @Param("companyId") Long companyId,
                            @Param("departId") Long departId,
                            @Param("workType") WorkType workType,
                            @Param("isActive") Boolean isActive,
                            Pageable pageable);

    @Query("SELECT s FROM Staff s WHERE s.isActive = :isActive AND s.person.isActive = :isActive")
    Page<Staff> findAllByIsActive(@Param("isActive") Boolean isActive, Pageable pageable);
    @Query("SELECT s FROM Staff s WHERE s.company.id = :companyId AND s.isActive = :isActive AND s.person.isActive = :isActive")
    Page<Staff> findAllByCompanyIdAndIsActive(
        @Param("companyId") Long companyId,
        @Param("isActive") Boolean isActive, 
        Pageable pageable
    );
    @Query("SELECT s FROM Staff s WHERE s.person.id = :personId")
    List<Staff> findByPersonId(@Param("personId")Long personId);
    @Query("SELECT s FROM Staff s WHERE s.person.id = :personId AND s.company.id = :companyId")
    Optional<Staff> findByPersonIdAndCompanyId(@Param("personId")Long personId, @Param("companyId") Long companyId);

    boolean existsByPersonIdAndCompanyId(Long personId, Long companyId);
    boolean existsByCompanyIdAndCustIdIgnoreCase(Long companyId, String custId);
    Optional<Staff> findByCompanyIdAndCustIdIgnoreCase(Long companyId, String custId);

    @Query("SELECT s FROM Staff s JOIN StaffOccupation so ON so.staff = s " +
        "WHERE s.department.id = :departId AND so.occupation.id = :occupationId " +
        "AND s.isActive = true AND s.person.isActive = true")
    List<Staff> findActiveByDepartmentIdAndOccupationId(@Param("departId") Long departId,
                                                        @Param("occupationId") Long occupationId);
}