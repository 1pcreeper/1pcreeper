package project.office_transport_service.service.checker;

import org.springframework.stereotype.Service;
import project.office_transport_service.model.entity.VrdSubmission;
import project.office_transport_service.model.entity.enums.VrdSubmissionStatus;
import project.shared_office_starter.model.exception.PropertyValidationException;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

@Service
public class VrdSubmissionCheckerService {

    public void checkSubmissionExists(VrdSubmission submission) {
        if (submission == null) {
            throw new ResourceNotFoundException("VRD submission not found.");
        }
    }

    public void checkPending(VrdSubmission submission) {
        checkSubmissionExists(submission);
        if (submission.getStatus() != VrdSubmissionStatus.PENDING) {
            throw new PropertyValidationException(
                "Submission has already been processed. Current status: " + submission.getStatus()
            );
        }
    }

    public void checkDeclineReason(String reason) {
        if (reason == null || reason.isBlank()) {
            throw new PropertyValidationException("Reason for declining submission cannot be blank.");
        }
    }
}
