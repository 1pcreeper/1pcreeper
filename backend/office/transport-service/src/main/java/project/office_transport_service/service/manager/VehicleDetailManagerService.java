package project.office_transport_service.service.manager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import project.office_transport_service.model.entity.VehicleDetail;
import project.office_transport_service.repository.VehicleDetailRepository;
import project.office_transport_service.service.base.AbstractBaseService;

import java.util.Optional;

@Service
public class VehicleDetailManagerService extends AbstractBaseService<VehicleDetail, Long> {

    private final VehicleDetailRepository vehicleDetailRepository;

    @Autowired
    public VehicleDetailManagerService(VehicleDetailRepository vehicleDetailRepository) {
        super(vehicleDetailRepository, "VehicleDetail");
        this.vehicleDetailRepository = vehicleDetailRepository;
    }

    public Optional<VehicleDetail> findByVehicleId(Long vehicleId) {
        return vehicleDetailRepository.findByVehicleId(vehicleId);
    }
}
