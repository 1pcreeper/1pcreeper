package project.office_transport_service.service.common;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.office_transport_service.mapper.VehicleVrdMapper;
import project.office_transport_service.model.dto.request.VehicleVrdCreateRequestDTO;
import project.office_transport_service.model.dto.request.VehicleVrdUpdateRequestDTO;
import project.office_transport_service.model.dto.response.VehicleVrdResponseDTO;
import project.office_transport_service.model.entity.Vehicle;
import project.office_transport_service.model.entity.VehicleVrd;
import project.office_transport_service.model.entity.enums.VrdStatus;
import project.office_transport_service.service.checker.VehicleCheckerService;
import project.office_transport_service.service.checker.VehicleVrdCheckerService;
import project.office_transport_service.service.manager.VehicleManagerService;
import project.office_transport_service.service.manager.VehicleVrdManagerService;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VehicleVrdService {

    private final VehicleVrdManagerService vehicleVrdManagerService;
    private final VehicleManagerService vehicleManagerService;
    private final VehicleVrdCheckerService vehicleVrdCheckerService;
    private final VehicleCheckerService vehicleCheckerService;
    private final VehicleVrdMapper vehicleVrdMapper;

    @Autowired
    public VehicleVrdService(
        VehicleVrdManagerService vehicleVrdManagerService,
        VehicleManagerService vehicleManagerService,
        VehicleVrdCheckerService vehicleVrdCheckerService,
        VehicleCheckerService vehicleCheckerService,
        VehicleVrdMapper vehicleVrdMapper
    ) {
        this.vehicleVrdManagerService = vehicleVrdManagerService;
        this.vehicleManagerService = vehicleManagerService;
        this.vehicleVrdCheckerService = vehicleVrdCheckerService;
        this.vehicleCheckerService = vehicleCheckerService;
        this.vehicleVrdMapper = vehicleVrdMapper;
    }

    public List<VehicleVrdResponseDTO> findVrdsByVehicleId(Long vehicleId) {
        Vehicle vehicle = vehicleManagerService.findById(vehicleId);
        vehicleCheckerService.checkVehicleIsActive(vehicle);

        List<VehicleVrd> vrds = vehicleVrdManagerService.findByVehicleId(vehicle.getId());
        return vrds.stream()
            .map(vehicleVrdMapper::toResponseDTO)
            .collect(Collectors.toList());
    }

    public VehicleVrdResponseDTO findById(Long vrdId) {
        VehicleVrd vrd = vehicleVrdManagerService.findById(vrdId);
        vehicleVrdCheckerService.checkVrdExists(vrd);
        return vehicleVrdMapper.toResponseDTO(vrd);
    }

    @Transactional
    public VehicleVrdResponseDTO createVrd(Long vehicleId, VehicleVrdCreateRequestDTO requestDTO) {
        Vehicle vehicle = vehicleManagerService.findById(vehicleId);
        vehicleCheckerService.checkVehicleIsActive(vehicle);
        vehicleVrdCheckerService.checkCreateRequest(requestDTO);

        VehicleVrd vrd = vehicleVrdMapper.toEntity(requestDTO, vehicle);
        VehicleVrd saved = vehicleVrdManagerService.save(vrd);

        // Keep vehicle vrdExpiryDate synced if this document is active
        if (saved.getStatus() == VrdStatus.ACTIVE && saved.getExpiryDate() != null) {
            vehicle.setVrdExpiryDate(saved.getExpiryDate());
            vehicleManagerService.save(vehicle);
        }

        return vehicleVrdMapper.toResponseDTO(saved);
    }

    @Transactional
    public VehicleVrdResponseDTO updateVrd(Long vrdId, VehicleVrdUpdateRequestDTO requestDTO) {
        VehicleVrd existing = vehicleVrdManagerService.findById(vrdId);
        vehicleVrdCheckerService.checkVrdExists(existing);
        vehicleVrdCheckerService.checkUpdateRequest(requestDTO);

        vehicleVrdMapper.updateEntity(requestDTO, existing);
        VehicleVrd saved = vehicleVrdManagerService.save(existing);

        if (saved.getStatus() == VrdStatus.ACTIVE && saved.getExpiryDate() != null && saved.getVehicle() != null) {
            Vehicle vehicle = saved.getVehicle();
            vehicle.setVrdExpiryDate(saved.getExpiryDate());
            vehicleManagerService.save(vehicle);
        }

        return vehicleVrdMapper.toResponseDTO(saved);
    }
}
