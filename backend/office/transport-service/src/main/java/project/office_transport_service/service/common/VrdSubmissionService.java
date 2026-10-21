package project.office_transport_service.service.common;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import project.office_transport_service.mapper.VehicleVrdMapper;
import project.office_transport_service.mapper.VrdSubmissionMapper;
import project.office_transport_service.model.dto.request.VehicleVrdCreateRequestDTO;
import project.office_transport_service.model.dto.request.VrdSubmissionApproveRequestDTO;
import project.office_transport_service.model.dto.request.VrdSubmissionDeclineRequestDTO;
import project.office_transport_service.model.dto.request.VrdSubmissionUpdateRequestDTO;
import project.office_transport_service.model.dto.response.VehicleVrdResponseDTO;
import project.office_transport_service.model.dto.response.VrdSubmissionResponseDTO;
import project.office_transport_service.model.dto.storage.StoredDocumentDTO;
import project.office_transport_service.model.entity.Vehicle;
import project.office_transport_service.model.entity.VehicleVrd;
import project.office_transport_service.model.entity.VrdSubmission;
import project.office_transport_service.model.entity.enums.VrdStatus;
import project.office_transport_service.model.entity.enums.VrdSubmissionStatus;
import project.office_transport_service.service.checker.VehicleCheckerService;
import project.office_transport_service.service.checker.VrdSubmissionCheckerService;
import project.office_transport_service.service.manager.VehicleManagerService;
import project.office_transport_service.service.manager.VehicleVrdManagerService;
import project.office_transport_service.service.manager.VrdSubmissionManagerService;
import project.office_transport_service.service.storage.DocumentStorageService;
import project.shared_office_starter.mapper.PaginationMapper;
import project.shared_office_starter.model.dto.base.PaginationBaseResponseDTO;
import project.shared_office_starter.model.exception.PropertyValidationException;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class VrdSubmissionService {

    private final VrdSubmissionManagerService vrdSubmissionManagerService;
    private final VehicleManagerService vehicleManagerService;
    private final VehicleVrdManagerService vehicleVrdManagerService;
    private final VrdSubmissionCheckerService vrdSubmissionCheckerService;
    private final VehicleCheckerService vehicleCheckerService;
    private final VrdSubmissionMapper vrdSubmissionMapper;
    private final VehicleVrdMapper vehicleVrdMapper;
    private final PaginationMapper paginationMapper;
    private final DocumentStorageService documentStorageService;

    @Autowired
    public VrdSubmissionService(
        VrdSubmissionManagerService vrdSubmissionManagerService,
        VehicleManagerService vehicleManagerService,
        VehicleVrdManagerService vehicleVrdManagerService,
        VrdSubmissionCheckerService vrdSubmissionCheckerService,
        VehicleCheckerService vehicleCheckerService,
        VrdSubmissionMapper vrdSubmissionMapper,
        VehicleVrdMapper vehicleVrdMapper,
        PaginationMapper paginationMapper,
        DocumentStorageService documentStorageService
    ) {
        this.vrdSubmissionManagerService = vrdSubmissionManagerService;
        this.vehicleManagerService = vehicleManagerService;
        this.vehicleVrdManagerService = vehicleVrdManagerService;
        this.vrdSubmissionCheckerService = vrdSubmissionCheckerService;
        this.vehicleCheckerService = vehicleCheckerService;
        this.vrdSubmissionMapper = vrdSubmissionMapper;
        this.vehicleVrdMapper = vehicleVrdMapper;
        this.paginationMapper = paginationMapper;
        this.documentStorageService = documentStorageService;
    }

    @Transactional
    public VrdSubmissionResponseDTO uploadScan(Long vehicleId, MultipartFile file) {
        Vehicle vehicle = vehicleManagerService.findById(vehicleId);
        vehicleCheckerService.checkVehicleIsActive(vehicle);

        if (file == null || file.isEmpty()) {
            throw new PropertyValidationException("Uploaded VRD scan document cannot be empty.");
        }

        UUID uploadUid = UUID.randomUUID();
        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "scan.pdf";
        String stagingKey = "staging/" + uploadUid + "/" + originalFilename;

        StoredDocumentDTO stored;
        try (InputStream is = file.getInputStream()) {
            stored = documentStorageService.put(
                stagingKey,
                is,
                file.getContentType() != null ? file.getContentType() : "application/pdf",
                file.getSize()
            );
        } catch (IOException e) {
            throw new PropertyValidationException("Failed to read uploaded VRD scan: " + e.getMessage());
        }

        VrdSubmission submission = vrdSubmissionMapper.toEntity(
            vehicle,
            stored.getRelativeKey(),
            stored.getSha256(),
            stored.getByteSize(),
            stored.getMediaType(),
            Map.of("raw_file_name", originalFilename, "uploaded_at", LocalDateTime.now().toString())
        );

        VrdSubmission saved = vrdSubmissionManagerService.save(submission);
        return vrdSubmissionMapper.toResponseDTO(saved);
    }

    public List<VrdSubmissionResponseDTO> findByVehicleId(Long vehicleId) {
        Vehicle vehicle = vehicleManagerService.findById(vehicleId);
        vehicleCheckerService.checkVehicleIsActive(vehicle);

        List<VrdSubmission> submissions = vrdSubmissionManagerService.findByVehicleId(vehicle.getId());
        return submissions.stream()
            .map(vrdSubmissionMapper::toResponseDTO)
            .collect(Collectors.toList());
    }

    public PaginationBaseResponseDTO<VrdSubmissionResponseDTO> findPendingSubmissions(Pageable pageable) {
        Page<VrdSubmission> page = vrdSubmissionManagerService.findByStatusPaged(VrdSubmissionStatus.PENDING, pageable);
        return paginationMapper.toDTO(page, vrdSubmissionMapper::toResponseDTO);
    }

    @Transactional
    public VrdSubmissionResponseDTO updateSubmission(Long vehicleId, Long submissionId, VrdSubmissionUpdateRequestDTO requestDTO) {
        VrdSubmission submission = vrdSubmissionManagerService.findById(submissionId);
        vrdSubmissionCheckerService.checkSubmissionExists(submission);

        vrdSubmissionMapper.updateEntity(requestDTO, submission, null);
        VrdSubmission saved = vrdSubmissionManagerService.save(submission);
        return vrdSubmissionMapper.toResponseDTO(saved);
    }

    @Transactional
    public VehicleVrdResponseDTO approveSubmission(Long vehicleId, Long submissionId, VrdSubmissionApproveRequestDTO requestDTO) {
        Vehicle vehicle = vehicleManagerService.findById(vehicleId);
        vehicleCheckerService.checkVehicleIsActive(vehicle);

        VrdSubmission submission = vrdSubmissionManagerService.findById(submissionId);
        vrdSubmissionCheckerService.checkPending(submission);

        // Mark submission as APPROVED
        submission.setStatus(VrdSubmissionStatus.APPROVED);
        submission.setReviewedAt(LocalDateTime.now());
        if (requestDTO != null && requestDTO.getScannedData() != null) {
            submission.setOcrRawData(requestDTO.getScannedData());
        }
        vrdSubmissionManagerService.save(submission);

        // Move/persist verified VRD into vehicle's permanent storage
        String permanentKey = "vehicles/" + vehicle.getUid() + "/vrds/" + submission.getSha256() + ".pdf";
        documentStorageService.read(submission.getFileKey()).ifPresent(is -> {
            documentStorageService.put(permanentKey, is, submission.getMediaType(), submission.getByteSize());
        });

        // Extract or default values from scannedData
        Map<String, Object> data = requestDTO != null && requestDTO.getScannedData() != null
            ? requestDTO.getScannedData()
            : Map.of();

        String regMark = data.getOrDefault("registrationMark", vehicle.getLicensePlate()).toString();
        String docNumber = data.getOrDefault("documentNumber", "VRD-" + System.currentTimeMillis()).toString();
        String ownerName = data.getOrDefault("registeredOwnerName", "").toString();
        LocalDate expiryDate = data.containsKey("expiryDate")
            ? LocalDate.parse(data.get("expiryDate").toString())
            : LocalDate.now().plusYears(1);

        VehicleVrdCreateRequestDTO createVrdDTO = VehicleVrdCreateRequestDTO.builder()
            .documentNumber(docNumber)
            .registrationMark(regMark)
            .registeredOwnerName(ownerName)
            .issueDate(LocalDate.now())
            .expiryDate(expiryDate)
            .fileKey(permanentKey)
            .sha256(submission.getSha256())
            .byteSize(submission.getByteSize())
            .mediaType(submission.getMediaType())
            .status(VrdStatus.ACTIVE)
            .build();

        VehicleVrd vrd = vehicleVrdMapper.toEntity(createVrdDTO, vehicle);
        VehicleVrd savedVrd = vehicleVrdManagerService.save(vrd);

        // Update vehicle's expiry date
        vehicle.setVrdExpiryDate(expiryDate);
        vehicleManagerService.save(vehicle);

        return vehicleVrdMapper.toResponseDTO(savedVrd);
    }

    @Transactional
    public VrdSubmissionResponseDTO declineSubmission(Long vehicleId, Long submissionId, VrdSubmissionDeclineRequestDTO requestDTO) {
        VrdSubmission submission = vrdSubmissionManagerService.findById(submissionId);
        vrdSubmissionCheckerService.checkPending(submission);
        vrdSubmissionCheckerService.checkDeclineReason(requestDTO.getReason());

        submission.setStatus(VrdSubmissionStatus.DECLINED);
        submission.setDeclineReason(requestDTO.getReason().trim());
        submission.setReviewedAt(LocalDateTime.now());

        VrdSubmission saved = vrdSubmissionManagerService.save(submission);
        return vrdSubmissionMapper.toResponseDTO(saved);
    }
}
