package project.office_transport_service.service.client;

import project.office_transport_service.model.dto.object.PersonSummaryDTO;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WorkforceDirectoryClient {
    Optional<PersonSummaryDTO> getPersonByUid(UUID personUid);
    boolean isPersonActive(UUID personUid);
    List<PersonSummaryDTO> searchPersons(String query, int limit);
}

