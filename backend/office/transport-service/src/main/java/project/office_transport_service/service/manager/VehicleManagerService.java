package project.office_transport_service.service.manager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.office_transport_service.mapper.VehicleMapper;
import project.office_transport_service.model.dto.object.VehicleDTO;
import project.office_transport_service.model.entity.Vehicle;
import project.office_transport_service.repository.VehicleRepository;
import project.office_transport_service.service.base.AbstractBaseService;
import project.office_transport_service.service.cache.VehicleCacheService;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class VehicleManagerService extends AbstractBaseService<Vehicle, Long> {

    private final VehicleRepository vehicleRepository;
    private final VehicleCacheService vehicleCacheService;
    private final VehicleMapper vehicleMapper;

    @Autowired
    public VehicleManagerService(
        VehicleRepository vehicleRepository,
        VehicleCacheService vehicleCacheService,
        VehicleMapper vehicleMapper
    ) {
        super(vehicleRepository, "Vehicle");
        this.vehicleRepository = vehicleRepository;
        this.vehicleCacheService = vehicleCacheService;
        this.vehicleMapper = vehicleMapper;
    }

    // --- READS ---
    @Override
    @Transactional(readOnly = true)
    public Vehicle findById(Long id) {
        // Automatically fetches from Caffeine cache, OR calls DB + populates cache cleanly!
        VehicleDTO dto = vehicleCacheService.findByIdOrLoad(id, () -> {
            Vehicle dbEntity = super.findById(id);
            return vehicleMapper.toDTO(dbEntity);
        });

        return convertToEntity(dto);
    }

    public Vehicle findByUid(UUID uid) {
        // Also self-populates cache by UID key
        VehicleDTO dto = vehicleCacheService.findByKeyOrLoad(uid, () -> {
            Vehicle dbEntity = vehicleRepository.findByUid(uid)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found by UID: " + uid));
            return vehicleMapper.toDTO(dbEntity);
        });

        return convertToEntity(dto);
    }

    // --- WRITES & MUTATIONS ---
    @Override
    public Vehicle save(Vehicle entity) {
        Vehicle saved = super.save(entity);
        VehicleDTO dto = vehicleMapper.toDTO(saved);
        vehicleCacheService.save(saved.getId(), dto);
        if (saved.getUid() != null) {
            vehicleCacheService.save(saved.getUid(), dto);
        }
        return saved;
    }

    @Override
    public void delete(Vehicle entity) {
        super.delete(entity);
        if (entity.getId() != null) vehicleCacheService.delete(entity.getId());
        if (entity.getUid() != null) vehicleCacheService.delete(entity.getUid());
    }

    @Override
    public void deleteById(Long id) {
        Vehicle existing = super.findById(id);
        super.deleteById(id);
        vehicleCacheService.delete(id);
        if (existing != null && existing.getUid() != null) {
            vehicleCacheService.delete(existing.getUid());
        }
    }

    @Override
    public void deleteAllByIds(List<Long> ids) {
        super.deleteAllByIds(ids);
        ids.forEach(vehicleCacheService::delete);
    }

    @Override
    public void deleteAll(List<Vehicle> entities) {
        super.deleteAll(entities);
        entities.forEach(e -> {
            if (e.getId() != null) vehicleCacheService.delete(e.getId());
            if (e.getUid() != null) vehicleCacheService.delete(e.getUid());
        });
    }

    // --- QUERIES ---
    @Transactional(readOnly = true)
    public Optional<Vehicle> findByLicensePlateIgnoreCaseAndIsActiveTrue(String licensePlate) {
        return vehicleRepository.findByLicensePlateIgnoreCaseAndIsActiveTrue(licensePlate);
    }

    @Transactional(readOnly = true)
    public Page<Vehicle> findByPersonUid(UUID personUid, Boolean isActive, Pageable pageable) {
        return vehicleRepository.findByPersonUid(personUid, isActive, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Vehicle> search(String q, UUID personUid, Boolean isActive, Pageable pageable) {
        return vehicleRepository.search(q, personUid, isActive, pageable);
    }

    @Transactional(readOnly = true)
    public List<Vehicle> findExpiringVrds(LocalDate thresholdDate) {
        return vehicleRepository.findExpiringVrds(thresholdDate);
    }

    @Transactional(readOnly = true)
    public boolean existsByLicensePlate(String licensePlate, Long excludeId) {
        return vehicleRepository.existsByLicensePlateIgnoreCaseAndIsActiveTrue(licensePlate, excludeId);
    }

    // --- MAPPING UTILITY ---
    private Vehicle convertToEntity(VehicleDTO dto) {
        if (dto == null) return null;
        Vehicle vehicle = Vehicle.builder()
            .uid(dto.getUid())
            .personUid(dto.getPersonUid())
            .licensePlate(dto.getLicensePlate())
            .make(dto.getMake())
            .model(dto.getModel())
            .yearOfManufacture(dto.getYearOfManufacture())
            .color(dto.getColor())
            .chassisNumber(dto.getChassisNumber())
            .engineNumber(dto.getEngineNumber())
            .engineCapacityCc(dto.getEngineCapacityCc())
            .seatingCapacity(dto.getSeatingCapacity())
            .fuelType(dto.getFuelType())
            .vehicleClass(dto.getVehicleClass())
            .vrdExpiryDate(dto.getVrdExpiryDate())
            .avatarUrl(dto.getAvatarUrl())
            .isActive(dto.getIsActive())
            .build();
        vehicle.setId(dto.getId());
        vehicle.setCreatedAt(dto.getCreatedAt());
        vehicle.setUpdatedAt(dto.getUpdatedAt());
        return vehicle;
    }
}
