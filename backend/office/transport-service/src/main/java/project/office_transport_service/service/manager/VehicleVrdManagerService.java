package project.office_transport_service.service.manager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import project.office_transport_service.model.entity.VehicleVrd;
import project.office_transport_service.model.entity.enums.VrdStatus;
import project.office_transport_service.repository.VehicleVrdRepository;
import project.office_transport_service.service.base.AbstractBaseService;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class VehicleVrdManagerService extends AbstractBaseService<VehicleVrd, Long> {

    private final VehicleVrdRepository vehicleVrdRepository;

    @Autowired
    public VehicleVrdManagerService(VehicleVrdRepository vehicleVrdRepository) {
        super(vehicleVrdRepository, "VehicleVrd");
        this.vehicleVrdRepository = vehicleVrdRepository;
    }

    public VehicleVrd findByUid(UUID uid) {
        return vehicleVrdRepository.findByUid(uid)
            .orElseThrow(() -> new ResourceNotFoundException("Vehicle VRD not found by UID: " + uid));
    }

    public List<VehicleVrd> findByVehicleId(Long vehicleId) {
        return vehicleVrdRepository.findByVehicleId(vehicleId);
    }

    public Optional<VehicleVrd> findByVehicleIdAndStatus(Long vehicleId, VrdStatus status) {
        return vehicleVrdRepository.findByVehicleIdAndStatus(vehicleId, status);
    }

    public Page<VehicleVrd> findByVehicleUid(UUID vehicleUid, Pageable pageable) {
        return vehicleVrdRepository.findByVehicleUid(vehicleUid, pageable);
    }

    public List<VehicleVrd> findExpiringVrds(LocalDate thresholdDate) {
        return vehicleVrdRepository.findExpiringVrds(thresholdDate);
    }
}
