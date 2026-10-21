package project.office_transport_service.service.common;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.office_transport_service.mapper.VehicleDetailMapper;
import project.office_transport_service.mapper.VehicleMapper;
import project.office_transport_service.mapper.VehicleVrdMapper;
import project.office_transport_service.model.dto.object.PersonSummaryDTO;
import project.office_transport_service.model.dto.object.VehicleDTO;
import project.office_transport_service.model.dto.object.VehicleDetailDTO;
import project.office_transport_service.model.dto.object.VehicleVrdDTO;
import project.office_transport_service.model.dto.request.VehicleAvatarUpdateRequestDTO;
import project.office_transport_service.model.dto.request.VehicleCreateRequestDTO;
import project.office_transport_service.model.dto.request.VehicleUpdateRequestDTO;
import project.office_transport_service.model.dto.request.VehicleVrdExpiryUpdateRequestDTO;
import project.office_transport_service.model.dto.response.VehicleDetailResponseDTO;
import project.office_transport_service.model.dto.response.VehicleResponseDTO;
import project.office_transport_service.model.entity.Vehicle;
import project.office_transport_service.model.entity.VehicleDetail;
import project.office_transport_service.model.entity.VehicleVrd;
import project.office_transport_service.service.checker.VehicleCheckerService;
import project.office_transport_service.service.client.WorkforceDirectoryClient;
import project.office_transport_service.service.manager.VehicleDetailManagerService;
import project.office_transport_service.service.manager.VehicleManagerService;
import project.office_transport_service.service.manager.VehicleVrdManagerService;
import project.office_transport_service.service.storage.VehicleExplorerStorageService;
import project.shared_office_starter.mapper.PaginationMapper;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class VehicleService {

    private final VehicleManagerService vehicleManagerService;
    private final VehicleDetailManagerService vehicleDetailManagerService;
    private final VehicleVrdManagerService vehicleVrdManagerService;
    private final VehicleCheckerService vehicleCheckerService;
    private final VehicleMapper vehicleMapper;
    private final VehicleDetailMapper vehicleDetailMapper;
    private final VehicleVrdMapper vehicleVrdMapper;
    private final PaginationMapper paginationMapper;
    private final WorkforceDirectoryClient workforceDirectoryClient;
    private final VehicleExplorerStorageService vehicleExplorerStorageService;

    @Autowired
    public VehicleService(
        VehicleManagerService vehicleManagerService,
        VehicleDetailManagerService vehicleDetailManagerService,
        VehicleVrdManagerService vehicleVrdManagerService,
        VehicleCheckerService vehicleCheckerService,
        VehicleMapper vehicleMapper,
        VehicleDetailMapper vehicleDetailMapper,
        VehicleVrdMapper vehicleVrdMapper,
        PaginationMapper paginationMapper,
        WorkforceDirectoryClient workforceDirectoryClient,
        VehicleExplorerStorageService vehicleExplorerStorageService
    ) {
        this.vehicleManagerService = vehicleManagerService;
        this.vehicleDetailManagerService = vehicleDetailManagerService;
        this.vehicleVrdManagerService = vehicleVrdManagerService;
        this.vehicleCheckerService = vehicleCheckerService;
        this.vehicleMapper = vehicleMapper;
        this.vehicleDetailMapper = vehicleDetailMapper;
        this.vehicleVrdMapper = vehicleVrdMapper;
        this.paginationMapper = paginationMapper;
        this.workforceDirectoryClient = workforceDirectoryClient;
        this.vehicleExplorerStorageService = vehicleExplorerStorageService;
    }

    public PaginationBaseResponseDTO<VehicleResponseDTO> findAll(Pageable pageable) {
        Page<Vehicle> vehiclePage = vehicleManagerService.findByPersonUid(null, true, pageable);
        return paginationMapper.toDTO(vehiclePage, this::enrichVehicleResponse);
    }

    public PaginationBaseResponseDTO<VehicleResponseDTO> search(String q, UUID personUid, Boolean isActive, Pageable pageable) {
        Page<Vehicle> vehiclePage = vehicleManagerService.search(q, personUid, isActive, pageable);
        return paginationMapper.toDTO(vehiclePage, this::enrichVehicleResponse);
    }

    public VehicleResponseDTO findById(Long id) {
        Vehicle vehicle = vehicleManagerService.findById(id);
        vehicleCheckerService.checkVehicleIsActive(vehicle);
        return enrichVehicleResponse(vehicle);
    }

    public VehicleResponseDTO findByUid(UUID uid) {
        Vehicle vehicle = vehicleManagerService.findByUid(uid);
        vehicleCheckerService.checkVehicleIsActive(vehicle);
        return enrichVehicleResponse(vehicle);
    }

    public VehicleDetailResponseDTO findByIdInDetail(Long id) {
        Vehicle vehicle = vehicleManagerService.findById(id);
        vehicleCheckerService.checkVehicleIsActive(vehicle);

        VehicleDTO vehicleDTO = vehicleMapper.toDTO(vehicle);

        VehicleDetail detail = vehicleDetailManagerService.findByVehicleId(vehicle.getId()).orElse(null);
        VehicleDetailDTO detailDTO = detail != null ? vehicleDetailMapper.toDTO(detail) : null;

        List<VehicleVrd> vrds = vehicleVrdManagerService.findByVehicleId(vehicle.getId());
        List<VehicleVrdDTO> vrdDTOs = vrds.stream()
            .map(vehicleVrdMapper::toDTO)
            .collect(Collectors.toList());

        PersonSummaryDTO ownerSummary = null;
        if (vehicle.getPersonUid() != null) {
            ownerSummary = workforceDirectoryClient.getPersonByUid(vehicle.getPersonUid()).orElse(null);
        }

        return VehicleDetailResponseDTO.builder()
            .vehicle(vehicleDTO)
            .detail(detailDTO)
            .vrds(vrdDTOs)
            .owner(ownerSummary)
            .build();
    }

    @Transactional
    public VehicleResponseDTO create(VehicleCreateRequestDTO requestDTO) {
        // 1. Validate domain assertions & business rules
        vehicleCheckerService.checkCreateRequest(requestDTO);

        // 2. Map and persist Vehicle entity
        Vehicle newVehicle = vehicleMapper.toEntity(requestDTO);
        Vehicle savedVehicle = vehicleManagerService.save(newVehicle);

        // 3. Create initial 1-to-1 VehicleDetail record
        VehicleDetail newDetail = vehicleDetailMapper.toEntity(requestDTO, savedVehicle);
        vehicleDetailManagerService.save(newDetail);

        // 4. Initialize Pure File System Explorer sandbox folders on disk
        vehicleExplorerStorageService.initializeVehicleDirectory(savedVehicle.getUid());

        // 5. Enrich owner info & return
        return enrichVehicleResponse(savedVehicle);
    }

    @Transactional
    public VehicleResponseDTO update(Long id, VehicleUpdateRequestDTO requestDTO) {
        Vehicle existingVehicle = vehicleManagerService.findById(id);
        vehicleCheckerService.checkVehicleIsActive(existingVehicle);
        vehicleCheckerService.checkUpdateRequest(id, requestDTO);

        // Mutate and save vehicle
        vehicleMapper.updateEntity(requestDTO, existingVehicle);
        Vehicle savedVehicle = vehicleManagerService.save(existingVehicle);

        // Update or create 1-to-1 detail
        Optional<VehicleDetail> detailOpt = vehicleDetailManagerService.findByVehicleId(savedVehicle.getId());
        if (detailOpt.isPresent()) {
            VehicleDetail detail = detailOpt.get();
            vehicleDetailMapper.updateEntity(requestDTO, detail);
            vehicleDetailManagerService.save(detail);
        } else {
            VehicleDetail newDetail = VehicleDetail.builder()
                .vehicle(savedVehicle)
                .insurancePolicyNumber(requestDTO.getInsurancePolicyNumber())
                .insuranceCompany(requestDTO.getInsuranceCompany())
                .insuranceExpiryDate(requestDTO.getInsuranceExpiryDate())
                .firstRegistrationDate(requestDTO.getFirstRegistrationDate())
                .notes(requestDTO.getNotes())
                .build();
            vehicleDetailManagerService.save(newDetail);
        }

        return enrichVehicleResponse(savedVehicle);
    }

    @Transactional
    public void delete(Long id) {
        Vehicle vehicle = vehicleManagerService.findById(id);
        vehicle.setIsActive(false);
        vehicleManagerService.save(vehicle);
    }

    @Transactional
    public VehicleResponseDTO updateAvatar(Long id, VehicleAvatarUpdateRequestDTO requestDTO) {
        Vehicle vehicle = vehicleManagerService.findById(id);
        vehicleCheckerService.checkVehicleIsActive(vehicle);

        vehicle.setAvatarUrl(requestDTO.getAvatarUrl());
        Vehicle saved = vehicleManagerService.save(vehicle);
        return enrichVehicleResponse(saved);
    }

    @Transactional
    public VehicleResponseDTO updateVrdExpiry(Long id, VehicleVrdExpiryUpdateRequestDTO requestDTO) {
        Vehicle vehicle = vehicleManagerService.findById(id);
        vehicleCheckerService.checkVehicleIsActive(vehicle);

        vehicle.setVrdExpiryDate(requestDTO.getVrdExpiryDate());
        Vehicle saved = vehicleManagerService.save(vehicle);
        return enrichVehicleResponse(saved);
    }

    private VehicleResponseDTO enrichVehicleResponse(Vehicle vehicle) {
        if (vehicle == null) return null;
        VehicleResponseDTO response = vehicleMapper.toResponseDTO(vehicle);

        if (vehicle.getPersonUid() != null) {
            workforceDirectoryClient.getPersonByUid(vehicle.getPersonUid()).ifPresent(owner -> {
                String fullName = owner.getNameEnglish() != null && !owner.getNameEnglish().isBlank()
                    ? owner.getNameEnglish()
                    : owner.getNameChinese();
                response.setOwnerName(fullName);
                response.setOwnerMobile(owner.getMobileTel());
                response.setOwnerEmail(owner.getEmail());
            });
        }

        return response;
    }
}
