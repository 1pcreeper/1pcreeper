package project.office_transport_service.service.cache;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;
import project.office_transport_service.model.dto.object.PersonSummaryDTO;
import project.shared_office_starter.service.base.AbstractCacheBaseService;

@Service
public class WorkforcePersonCacheService extends AbstractCacheBaseService<PersonSummaryDTO> {

    @Autowired
    public WorkforcePersonCacheService(CacheManager cacheManager) {
        super("workforce_persons", PersonSummaryDTO.class, cacheManager);
    }
}
