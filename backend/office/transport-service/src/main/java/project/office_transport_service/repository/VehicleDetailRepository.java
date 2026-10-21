package project.office_transport_service.repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.office_transport_service.model.entity.VehicleDetail;
import project.office_transport_service.repository.base.AbstractBaseRepository;

import java.util.Optional;

@Repository
public interface VehicleDetailRepository extends AbstractBaseRepository<VehicleDetail, Long> {

    @Query("SELECT vd FROM VehicleDetail vd WHERE vd.vehicle.id = :vehicleId")
    Optional<VehicleDetail> findByVehicleId(@Param("vehicleId") Long vehicleId);
}
