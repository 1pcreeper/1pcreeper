package project.office_transport_service.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.office_transport_service.model.entity.VehicleVrd;
import project.office_transport_service.model.entity.enums.VrdStatus;
import project.office_transport_service.repository.base.AbstractBaseRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VehicleVrdRepository extends AbstractBaseRepository<VehicleVrd, Long> {

    @Query("SELECT vrd FROM VehicleVrd vrd WHERE vrd.uid = :uid")
    Optional<VehicleVrd> findByUid(@Param("uid") UUID uid);

    @Query("SELECT vrd FROM VehicleVrd vrd WHERE vrd.vehicle.id = :vehicleId ORDER BY vrd.createdAt DESC")
    List<VehicleVrd> findByVehicleId(@Param("vehicleId") Long vehicleId);

    @Query("SELECT vrd FROM VehicleVrd vrd WHERE vrd.vehicle.id = :vehicleId AND vrd.status = :status")
    Optional<VehicleVrd> findByVehicleIdAndStatus(@Param("vehicleId") Long vehicleId,
                                                 @Param("status") VrdStatus status);

    @Query("SELECT vrd FROM VehicleVrd vrd WHERE vrd.vehicle.uid = :vehicleUid ORDER BY vrd.createdAt DESC")
    Page<VehicleVrd> findByVehicleUid(@Param("vehicleUid") UUID vehicleUid, Pageable pageable);

    @Query("SELECT vrd FROM VehicleVrd vrd WHERE vrd.status = 'ACTIVE' AND vrd.expiryDate <= :thresholdDate")
    List<VehicleVrd> findExpiringVrds(@Param("thresholdDate") LocalDate thresholdDate);
}
