package project.office_workforce_service.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.office_workforce_service.model.entity.Organization;
import project.office_workforce_service.repository.base.AbstractBaseRepository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrganizationRepository extends AbstractBaseRepository<Organization, Long> {

    @Query("SELECT o FROM Organization o WHERE " +
        "(:q IS NULL OR " +
        "LOWER(o.nameEnglish) LIKE LOWER(CONCAT('%', CAST(:q AS String), '%')) OR " +
        "LOWER(o.nameChinese) LIKE LOWER(CONCAT('%', CAST(:q AS String), '%')) OR " +
        "LOWER(o.email) LIKE LOWER(CONCAT('%', CAST(:q AS String), '%')) OR " +
        "LOWER(o.businessRegistrationNumber) LIKE LOWER(CONCAT('%', CAST(:q AS String), '%')) OR " +
        "LOWER(o.secretaryLicenseNumber) LIKE LOWER(CONCAT('%', CAST(:q AS String), '%')) OR " +
        "o.tel LIKE LOWER(CONCAT('%', CAST(:q AS String), '%'))) " +
        "AND (:isActive IS NULL OR o.isActive = :isActive)")
    Page<Organization> search(@Param("q") String q,
                              @Param("isActive") Boolean isActive,
                              Pageable pageable);

    @Query("SELECT o FROM Organization o WHERE o.uid = :uid")
    Optional<Organization> findByUid(@Param("uid") UUID uid);

    @Query("SELECT o FROM Organization o WHERE o.isActive = :isActive")
    Page<Organization> findAllByIsActive(@Param("isActive") Boolean isActive, Pageable pageable);

    Optional<Organization> findByBusinessRegistrationNumber(String businessRegistrationNumber);

    Optional<Organization> findBySecretaryLicenseNumber(String secretaryLicenseNumber);

    boolean existsByBusinessRegistrationNumber(String businessRegistrationNumber);

    boolean existsBySecretaryLicenseNumber(String secretaryLicenseNumber);
}
