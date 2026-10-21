package project.office_transport_service.service.manager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import project.office_transport_service.model.entity.VrdSubmission;
import project.office_transport_service.model.entity.enums.VrdSubmissionStatus;
import project.office_transport_service.repository.VrdSubmissionRepository;
import project.office_transport_service.service.base.AbstractBaseService;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

import java.util.List;
import java.util.UUID;

@Service
public class VrdSubmissionManagerService extends AbstractBaseService<VrdSubmission, Long> {

    private final VrdSubmissionRepository vrdSubmissionRepository;

    @Autowired
    public VrdSubmissionManagerService(VrdSubmissionRepository vrdSubmissionRepository) {
        super(vrdSubmissionRepository, "VrdSubmission");
        this.vrdSubmissionRepository = vrdSubmissionRepository;
    }

    public VrdSubmission findByUid(UUID uid) {
        return vrdSubmissionRepository.findByUid(uid)
            .orElseThrow(() -> new ResourceNotFoundException("VRD Submission not found by UID: " + uid));
    }

    public List<VrdSubmission> findByStatus(VrdSubmissionStatus status) {
        return vrdSubmissionRepository.findByStatus(status);
    }

    public Page<VrdSubmission> findByStatusPaged(VrdSubmissionStatus status, Pageable pageable) {
        return vrdSubmissionRepository.findByStatusPaged(status, pageable);
    }

    public List<VrdSubmission> findByVehicleId(Long vehicleId) {
        return vrdSubmissionRepository.findByVehicleId(vehicleId);
    }

    public Page<VrdSubmission> findByVehicleUid(UUID vehicleUid, Pageable pageable) {
        return vrdSubmissionRepository.findByVehicleUid(vehicleUid, pageable);
    }

    public long countPending() {
        return vrdSubmissionRepository.countPending();
    }
}
