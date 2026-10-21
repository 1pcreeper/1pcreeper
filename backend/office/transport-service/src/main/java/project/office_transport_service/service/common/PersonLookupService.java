package project.office_transport_service.service.common;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import project.office_transport_service.model.dto.object.PersonSummaryDTO;
import project.office_transport_service.service.client.WorkforceDirectoryClient;
import project.shared_office_starter.model.exception.ResourceNotFoundException;

import java.util.List;
import java.util.UUID;

@Service
public class PersonLookupService {

    private final WorkforceDirectoryClient workforceDirectoryClient;

    @Autowired
    public PersonLookupService(WorkforceDirectoryClient workforceDirectoryClient) {
        this.workforceDirectoryClient = workforceDirectoryClient;
    }

    public List<PersonSummaryDTO> searchPersons(String query) {
        return workforceDirectoryClient.searchPersons(query, 50);
    }

    public PersonSummaryDTO findByUid(UUID uid) {
        return workforceDirectoryClient.getPersonByUid(uid)
            .orElseThrow(() -> new ResourceNotFoundException("Person not found with UID: " + uid));
    }
}
