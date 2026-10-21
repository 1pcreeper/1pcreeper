package project.office_transport_service.service.client;

import io.grpc.StatusRuntimeException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import project.office_transport_service.model.dto.object.PersonSummaryDTO;
import project.office_transport_service.service.cache.WorkforcePersonCacheService;
import project.shared_office_starter.grpc.OfficePersonActiveResponse;
import project.shared_office_starter.grpc.OfficePersonRequest;
import project.shared_office_starter.grpc.OfficePersonResponse;
import project.shared_office_starter.grpc.OfficeWorkforceRPCServiceGrpc;

import project.shared_office_starter.grpc.OfficePersonSearchRequest;
import project.shared_office_starter.grpc.OfficePersonListResponse;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
public class GrpcWorkforceDirectoryClient implements WorkforceDirectoryClient {

    private final OfficeWorkforceRPCServiceGrpc.OfficeWorkforceRPCServiceBlockingStub workforceStub;
    private final WorkforcePersonCacheService workforcePersonCacheService;

    @Autowired
    public GrpcWorkforceDirectoryClient(
        OfficeWorkforceRPCServiceGrpc.OfficeWorkforceRPCServiceBlockingStub workforceStub,
        WorkforcePersonCacheService workforcePersonCacheService
    ) {
        this.workforceStub = workforceStub;
        this.workforcePersonCacheService = workforcePersonCacheService;
    }

    @Override
    public Optional<PersonSummaryDTO> getPersonByUid(UUID personUid) {
        if (personUid == null) return Optional.empty();

        PersonSummaryDTO cached = workforcePersonCacheService.findByKeyOrLoad(personUid, () -> {
            try {
                OfficePersonRequest request = OfficePersonRequest.newBuilder()
                    .setUid(personUid.toString())
                    .build();
                OfficePersonResponse response = workforceStub.getPersonByUid(request);
                return PersonSummaryDTO.builder()
                    .uid(UUID.fromString(response.getUid()))
                    .nameEnglish(response.getNameEnglish())
                    .nameChinese(response.getNameChinese())
                    .mobileTel(response.getMobileTel())
                    .officeTel(response.getOfficeTel())
                    .email(response.getEmail())
                    .hkId(response.getHkId())
                    .isActive(response.getIsActive())
                    .build();
            } catch (StatusRuntimeException e) {
                log.warn("gRPC getPersonByUid call failed for UID {}: {}", personUid, e.getStatus());
                return null;
            } catch (Exception e) {
                log.error("Unexpected error resolving person for UID {}: {}", personUid, e.getMessage(), e);
                return null;
            }
        });

        return Optional.ofNullable(cached);
    }

    @Override
    public boolean isPersonActive(UUID personUid) {
        if (personUid == null) return false;

        Optional<PersonSummaryDTO> cached = getPersonByUid(personUid);
        if (cached.isPresent()) {
            return Boolean.TRUE.equals(cached.get().getIsActive());
        }

        try {
            OfficePersonRequest request = OfficePersonRequest.newBuilder()
                .setUid(personUid.toString())
                .build();
            OfficePersonActiveResponse response = workforceStub.verifyPersonActive(request);
            return response.getIsActive();
        } catch (StatusRuntimeException e) {
            log.warn("gRPC verifyPersonActive call failed for UID {}: {}", personUid, e.getStatus());
            return false;
        }
    }

    @Override
    public List<PersonSummaryDTO> searchPersons(String query, int limit) {
        try {
            OfficePersonSearchRequest request = OfficePersonSearchRequest.newBuilder()
                .setQuery(query != null ? query : "")
                .setLimit(limit > 0 ? limit : 20)
                .build();
            OfficePersonListResponse response = workforceStub.searchPersons(request);
            List<PersonSummaryDTO> result = new ArrayList<>();
            for (OfficePersonResponse p : response.getPersonsList()) {
                PersonSummaryDTO dto = PersonSummaryDTO.builder()
                    .uid(UUID.fromString(p.getUid()))
                    .nameEnglish(p.getNameEnglish())
                    .nameChinese(p.getNameChinese())
                    .mobileTel(p.getMobileTel())
                    .officeTel(p.getOfficeTel())
                    .email(p.getEmail())
                    .hkId(p.getHkId())
                    .isActive(p.getIsActive())
                    .build();
                workforcePersonCacheService.save(dto.getUid(), dto);
                result.add(dto);
            }
            return result;
        } catch (StatusRuntimeException e) {
            log.warn("gRPC searchPersons call failed: {}", e.getStatus());
            return Collections.emptyList();
        } catch (Exception e) {
            log.error("Unexpected error searching persons via gRPC: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }
}

