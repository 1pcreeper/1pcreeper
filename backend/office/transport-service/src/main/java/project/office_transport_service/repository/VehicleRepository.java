package project.office_transport_service.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.office_transport_service.model.entity.Vehicle;
import project.office_transport_service.repository.base.AbstractBaseRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VehicleRepository extends AbstractBaseRepository<Vehicle, Long> {

    @Query("SELECT v FROM Vehicle v WHERE v.uid = :uid")
    Optional<Vehicle> findByUid(@Param("uid") UUID uid);

    @Query("SELECT v FROM Vehicle v WHERE LOWER(v.licensePlate) = LOWER(:licensePlate) AND v.isActive = true")
    Optional<Vehicle> findByLicensePlateIgnoreCaseAndIsActiveTrue(@Param("licensePlate") String licensePlate);

    @Query("SELECT v FROM Vehicle v WHERE v.personUid = :personUid AND (:isActive IS NULL OR v.isActive = :isActive)")
    Page<Vehicle> findByPersonUid(@Param("personUid") UUID personUid,
                                  @Param("isActive") Boolean isActive,
                                  Pageable pageable);

    @Query("SELECT v FROM Vehicle v WHERE " +
           "(:personUid IS NULL OR v.personUid = :personUid) AND " +
           "(:q IS NULL OR " +
           "LOWER(v.licensePlate) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(v.make) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(v.model) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(v.chassisNumber) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(v.engineNumber) LIKE LOWER(CONCAT('%', :q, '%'))) AND " +
           "(:isActive IS NULL OR v.isActive = :isActive)")
    Page<Vehicle> search(@Param("q") String q,
                         @Param("personUid") UUID personUid,
                         @Param("isActive") Boolean isActive,
                         Pageable pageable);

    @Query("SELECT v FROM Vehicle v WHERE v.isActive = true AND v.vrdExpiryDate IS NOT NULL AND v.vrdExpiryDate <= :thresholdDate")
    List<Vehicle> findExpiringVrds(@Param("thresholdDate") LocalDate thresholdDate);

    @Query("SELECT COUNT(v) > 0 FROM Vehicle v WHERE LOWER(v.licensePlate) = LOWER(:licensePlate) AND v.isActive = true AND (:excludeId IS NULL OR v.id <> :excludeId)")
    boolean existsByLicensePlateIgnoreCaseAndIsActiveTrue(@Param("licensePlate") String licensePlate,
                                                          @Param("excludeId") Long excludeId);
}
