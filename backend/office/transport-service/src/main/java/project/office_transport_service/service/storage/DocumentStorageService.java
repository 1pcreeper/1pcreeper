package project.office_transport_service.service.storage;

import project.office_transport_service.model.dto.storage.StoredDocumentDTO;

import java.io.InputStream;
import java.util.Optional;

public interface DocumentStorageService {
    StoredDocumentDTO put(String relativeKey, InputStream content, String mediaType, long contentLength);
    Optional<InputStream> read(String relativeKey);
    StoredDocumentDTO stat(String relativeKey);
    boolean delete(String relativeKey);
}
